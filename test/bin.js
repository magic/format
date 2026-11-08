import path from 'node:path'
import fs from '@magic/fs'

import { getPaths, run } from '../src/bin.js'
import { buildOxfmtArgs, getOxfmtBin, setOxfmtBin } from '../src/lib.js'
import { format } from '../src/index.js'

/** @type {string} */
const fakeOxfmt = path.join(process.cwd(), 'test', '.fixtures', 'fake-oxfmt.js')

/** @type {Promise<unknown>} */
let chain = Promise.resolve()

/**
 * Runs async fns one at a time, so tests that share process state
 * (argv, the test oxfmt bin) never interleave
 * @template {() => Promise<any>} T
 * @param {T} fn
 * @returns {Promise<any>}
 */
const serialized = fn => {
  const next = chain.then(fn, fn)
  chain = next.catch(() => {})
  return next
}

/**
 * Runs the f cli in-process with a fake oxfmt binary
 * @param {string[]} argv - full process.argv
 * @param {string} [scenario] - FAKE_OXFMt_SCENARIO value
 * @returns {Promise<{code: number|null}>}
 */
const runCli = (argv, scenario) =>
  serialized(async () => {
    const originalArgv = process.argv
    const originalScenario = process.env.FAKE_OXFMt_SCENARIO
    const originalBin = getOxfmtBin()

    process.argv = argv
    setOxfmtBin(fakeOxfmt)
    if (scenario) {
      process.env.FAKE_OXFMt_SCENARIO = scenario
    }

    try {
      return { code: await run() }
    } finally {
      process.argv = originalArgv
      setOxfmtBin(originalBin)
      if (originalScenario === undefined) {
        delete process.env.FAKE_OXFMt_SCENARIO
      } else {
        process.env.FAKE_OXFMt_SCENARIO = originalScenario
      }
    }
  })

export default [
  {
    fn: () => typeof getOxfmtBin() === 'string' && getOxfmtBin().endsWith('oxfmt'),
    expect: true,
    info: 'getOxfmtBin resolves the oxfmt binary',
  },
  {
    fn: () => {
      const paths = getPaths(['node', 'bin.js', 'f'])
      return paths.length === 0
    },
    expect: true,
    info: 'getPaths ignores the command token',
  },
  {
    fn: () => {
      const paths = getPaths(['node', 'bin.js', 'f', 'src', 'index.js'])
      return paths.length === 2 && paths[0] === 'src' && paths[1] === 'index.js'
    },
    expect: true,
    info: 'getPaths collects positional paths',
  },
  {
    fn: () => {
      const paths = getPaths(['node', 'bin.js', 'f', '-w', '-e', 'docs/', 'src'])
      return paths.length === 1 && paths[0] === 'src'
    },
    expect: true,
    info: 'getPaths skips flags and flag values',
  },
  {
    fn: () => {
      const paths = getPaths(['node', 'bin.js', 'f', '-c', 'my.conf', '-f', 'js', 'src'])
      return paths.length === 1 && paths[0] === 'src'
    },
    expect: true,
    info: 'getPaths skips all value flags',
  },
  {
    fn: () => {
      const args = buildOxfmtArgs({ paths: ['src'] })
      return args[0] === '--list-different' && args.includes('src')
    },
    expect: true,
    info: 'buildOxfmtArgs defaults to list-different mode',
  },
  {
    fn: () => {
      const args = buildOxfmtArgs({ args: { write: true }, paths: ['src'] })
      return args[0] === '--write'
    },
    expect: true,
    info: 'buildOxfmtArgs uses write mode',
  },
  {
    fn: () => {
      const args = buildOxfmtArgs({ paths: ['src'], configFile: '/tmp/c.json' })
      return args.includes('-c') && args[args.indexOf('-c') + 1] === '/tmp/c.json'
    },
    expect: true,
    info: 'buildOxfmtArgs passes the config file',
  },
  {
    fn: () => {
      const args = buildOxfmtArgs({ args: { fileTypes: ['js', 'json'] }, paths: ['src'] })
      return args.includes('**/*.{js,json}')
    },
    expect: true,
    info: 'buildOxfmtArgs adds a glob for file types',
  },
  {
    fn: () => {
      const args = buildOxfmtArgs({ args: { exclude: ['docs/'] }, paths: ['src'] })
      return args.includes('!docs/**')
    },
    expect: true,
    info: 'buildOxfmtArgs converts directory excludes to globs',
  },
  {
    fn: () => {
      const args = buildOxfmtArgs({ args: { exclude: ['!custom/**/*.js'] }, paths: ['src'] })
      return args.includes('!custom/**/*.js')
    },
    expect: true,
    info: 'buildOxfmtArgs passes explicit glob excludes through',
  },
  {
    fn: () => {
      const args = buildOxfmtArgs({ args: { exclude: 'single' }, paths: ['src'] })
      return args.includes('!single/**')
    },
    expect: true,
    info: 'buildOxfmtArgs handles string excludes',
  },
  {
    fn: () => {
      const args = buildOxfmtArgs({ paths: ['src'] })
      return args.includes('--no-error-on-unmatched-pattern')
    },
    expect: true,
    info: 'buildOxfmtArgs tolerates unmatched patterns',
  },
  {
    fn: () =>
      serialized(async () => {
        process.env.MAGIC_FORMAT_OXFMT_BIN = '/custom/oxfmt'
        try {
          return getOxfmtBin() === '/custom/oxfmt'
        } finally {
          delete process.env.MAGIC_FORMAT_OXFMT_BIN
        }
      }),
    expect: true,
    info: 'getOxfmtBin respects the env override',
  },
  {
    fn: async () => {
      const { code } = await runCli(['node', 'bin.js', 'f'], 'check=clean')
      return code === 0
    },
    expect: true,
    info: 'run exits 0 when everything is formatted',
  },
  {
    fn: async () => {
      const { code } = await runCli(['node', 'bin.js', 'f'], 'check=list')
      return code === 1
    },
    expect: true,
    info: 'run exits 1 when unformatted files are found',
  },
  {
    fn: async () => {
      const { code } = await runCli(['node', 'bin.js', 'f'], 'check=error')
      return code === 2
    },
    expect: true,
    info: 'run exits 2 on parse errors',
  },
  {
    fn: async () => {
      const { code } = await runCli(['node', 'bin.js', 'f'], 'check=crash')
      return code === 1
    },
    expect: true,
    info: 'run exits 1 when oxfmt crashed without listing files',
  },
  {
    fn: async () => {
      const { code } = await runCli(['node', 'bin.js', 'f', '-w'], 'check=list,write=clean')
      return code === 0
    },
    expect: true,
    info: 'run -w exits 0 after writing changed files',
  },
  {
    fn: async () => {
      const { code } = await runCli(['node', 'bin.js', 'f', '-w'], 'check=clean')
      return code === 0
    },
    expect: true,
    info: 'run -w exits 0 when nothing changed',
  },
  {
    fn: async () => {
      const { code } = await runCli(['node', 'bin.js', 'f', '-w', '-s'], 'check=clean')
      return code === 0
    },
    expect: true,
    info: 'run -w -s is silent and exits 0',
  },
  {
    fn: async () => {
      const { code } = await runCli(['node', 'bin.js', 'f', '-w'], 'check=list,write=error')
      return code === 2
    },
    expect: true,
    info: 'run -w exits 2 when the write pass reports parse errors',
  },
  {
    fn: async () => {
      const { code } = await runCli(['node', 'bin.js', 'f', '-w'], 'check=list,write=write-crash')
      return code === 3
    },
    expect: true,
    info: 'run -w propagates unexpected oxfmt failures',
  },
  {
    fn: async () => {
      const { code } = await runCli(['node', 'bin.js', 'f', '-v'], 'check=list-err')
      return code === 1
    },
    expect: true,
    info: 'run -v echoes oxfmt stderr in check mode',
  },
  {
    fn: async () => {
      const { code } = await runCli(
        ['node', 'bin.js', 'f', '-w', '-v'],
        'check=list,write=write-warn',
      )
      return code === 0
    },
    expect: true,
    info: 'run -w -v echoes oxfmt stderr in write mode',
  },
  {
    fn: async () => {
      const { code } = await runCli(['node', 'bin.js', 'f', 'src', 'index.js'], 'check=clean')
      return code === 0
    },
    expect: true,
    info: 'run accepts positional paths',
  },
  {
    fn: async () => {
      const dir = path.join(process.cwd(), 'test', '.binTempConfig')
      await fs.mkdir(dir, { recursive: true })
      const configPath = path.join(dir, 'user.config.json')
      await fs.writeFile(configPath, '{"printWidth": 80}')
      try {
        const { code } = await runCli(['node', 'bin.js', 'f', '-c', configPath], 'check=clean')
        return code === 0
      } finally {
        await fs.rm(dir, { recursive: true, force: true })
      }
    },
    expect: true,
    info: 'run merges an explicit json config and cleans up the temp file',
  },
  {
    fn: async () => {
      const dir = path.join(process.cwd(), 'test', '.binCrashTempConfig')
      await fs.mkdir(dir, { recursive: true })
      const configPath = path.join(dir, 'user.config.json')
      await fs.writeFile(configPath, '{"printWidth": 80}')
      try {
        const { code } = await runCli(['node', 'bin.js', 'f', '-c', configPath], 'check=crash')
        return code === 1
      } finally {
        await fs.rm(dir, { recursive: true, force: true })
      }
    },
    expect: true,
    info: 'run cleans up the temp file when oxfmt crashed',
  },
  {
    fn: async () =>
      serialized(async () => {
        const originalBin = getOxfmtBin()
        const originalScenario = process.env.FAKE_OXFMt_SCENARIO
        setOxfmtBin(fakeOxfmt)
        process.env.FAKE_OXFMt_SCENARIO = 'check=error'
        try {
          const result = await format({ include: 'nonexistent', fileTypes: ['js'] })
          return Array.isArray(result) && result.length === 0
        } finally {
          setOxfmtBin(originalBin)
          if (originalScenario === undefined) {
            delete process.env.FAKE_OXFMt_SCENARIO
          } else {
            process.env.FAKE_OXFMt_SCENARIO = originalScenario
          }
        }
      }),
    expect: true,
    info: 'format returns [] when oxfmt reports parse errors (exit 2)',
  },
  {
    fn: async () =>
      serialized(async () => {
        const originalBin = getOxfmtBin()
        const originalScenario = process.env.FAKE_OXFMt_SCENARIO
        setOxfmtBin(fakeOxfmt)
        process.env.FAKE_OXFMt_SCENARIO = 'check=code5'
        try {
          const result = await format({ include: 'nonexistent', fileTypes: ['js'] })
          return Array.isArray(result) && result.length === 0
        } finally {
          setOxfmtBin(originalBin)
          if (originalScenario === undefined) {
            delete process.env.FAKE_OXFMt_SCENARIO
          } else {
            process.env.FAKE_OXFMt_SCENARIO = originalScenario
          }
        }
      }),
    expect: true,
    info: 'format returns [] when oxfmt exits with an unexpected code and no stderr',
  },
  {
    fn: async () =>
      serialized(async () => {
        const originalBin = getOxfmtBin()
        const originalScenario = process.env.FAKE_OXFMt_SCENARIO
        setOxfmtBin(fakeOxfmt)
        process.env.FAKE_OXFMt_SCENARIO = 'check=crash'
        try {
          const result = await format({ include: 'nonexistent', fileTypes: ['js'] })
          return Array.isArray(result) && result.length === 0
        } finally {
          setOxfmtBin(originalBin)
          if (originalScenario === undefined) {
            delete process.env.FAKE_OXFMt_SCENARIO
          } else {
            process.env.FAKE_OXFMt_SCENARIO = originalScenario
          }
        }
      }),
    expect: true,
    info: 'format returns [] when oxfmt exited 1 with stderr but no files listed',
  },
  {
    fn: async () =>
      serialized(async () => {
        const originalBin = getOxfmtBin()
        const originalScenario = process.env.FAKE_OXFMt_SCENARIO
        setOxfmtBin(fakeOxfmt)
        process.env.FAKE_OXFMt_SCENARIO = 'check=silent'
        try {
          const result = await format({ include: 'nonexistent', fileTypes: ['js'] })
          return Array.isArray(result) && result.length === 0
        } finally {
          setOxfmtBin(originalBin)
          if (originalScenario === undefined) {
            delete process.env.FAKE_OXFMt_SCENARIO
          } else {
            process.env.FAKE_OXFMt_SCENARIO = originalScenario
          }
        }
      }),
    expect: true,
    info: 'format returns [] when oxfmt exited 1 with no output at all',
  },
  {
    fn: async () =>
      serialized(async () => {
        const originalBin = getOxfmtBin()
        const originalScenario = process.env.FAKE_OXFMt_SCENARIO
        setOxfmtBin(fakeOxfmt)
        process.env.FAKE_OXFMt_SCENARIO = 'check=list,write=error'
        try {
          const result = await format({
            include: 'nonexistent',
            fileTypes: ['js'],
            write: true,
          })
          return Array.isArray(result) && result.length === 0
        } finally {
          setOxfmtBin(originalBin)
          if (originalScenario === undefined) {
            delete process.env.FAKE_OXFMt_SCENARIO
          } else {
            process.env.FAKE_OXFMt_SCENARIO = originalScenario
          }
        }
      }),
    expect: true,
    info: 'format returns [] when the write pass reports parse errors (exit 2)',
  },
  {
    fn: async () =>
      serialized(async () => {
        const originalBin = getOxfmtBin()
        const originalScenario = process.env.FAKE_OXFMt_SCENARIO
        setOxfmtBin(fakeOxfmt)
        process.env.FAKE_OXFMt_SCENARIO = 'check=list,write=write-crash'
        try {
          const result = await format({
            include: 'nonexistent',
            fileTypes: ['js'],
            write: true,
          })
          return Array.isArray(result) && result.length === 0
        } finally {
          setOxfmtBin(originalBin)
          if (originalScenario === undefined) {
            delete process.env.FAKE_OXFMt_SCENARIO
          } else {
            process.env.FAKE_OXFMt_SCENARIO = originalScenario
          }
        }
      }),
    expect: true,
    info: 'format returns [] when the write pass fails with stderr',
  },
  {
    fn: async () =>
      serialized(async () => {
        const originalBin = getOxfmtBin()
        const originalScenario = process.env.FAKE_OXFMt_SCENARIO
        const dir = path.join(process.cwd(), 'test', '.binFormatTempConfig')
        await fs.mkdir(dir, { recursive: true })
        const configPath = path.join(dir, 'user.config.json')
        await fs.writeFile(configPath, '{"printWidth": 80}')
        setOxfmtBin(fakeOxfmt)
        process.env.FAKE_OXFMt_SCENARIO = 'check=list,write=write-crash'
        try {
          const result = await format({
            config: configPath,
            include: 'nonexistent',
            fileTypes: ['js'],
            write: true,
          })
          return Array.isArray(result) && result.length === 0
        } finally {
          setOxfmtBin(originalBin)
          if (originalScenario === undefined) {
            delete process.env.FAKE_OXFMt_SCENARIO
          } else {
            process.env.FAKE_OXFMt_SCENARIO = originalScenario
          }
          await fs.rm(dir, { recursive: true, force: true })
        }
      }),
    expect: true,
    info: 'format cleans up the merged temp config when the write pass fails',
  },
  {
    fn: async () =>
      serialized(async () => {
        const originalBin = getOxfmtBin()
        const originalScenario = process.env.FAKE_OXFMt_SCENARIO
        const dir = path.join(process.cwd(), 'test', '.binFormatTempConfig')
        await fs.mkdir(dir, { recursive: true })
        const configPath = path.join(dir, 'user.config.json')
        await fs.writeFile(configPath, '{"printWidth": 80}')
        setOxfmtBin(fakeOxfmt)
        process.env.FAKE_OXFMt_SCENARIO = 'check=list,write=clean'
        try {
          const result = await format({
            config: configPath,
            include: 'nonexistent',
            fileTypes: ['js'],
            write: true,
          })
          return Array.isArray(result) && result.length === 2
        } finally {
          setOxfmtBin(originalBin)
          if (originalScenario === undefined) {
            delete process.env.FAKE_OXFMt_SCENARIO
          } else {
            process.env.FAKE_OXFMt_SCENARIO = originalScenario
          }
          await fs.rm(dir, { recursive: true, force: true })
        }
      }),
    expect: true,
    info: 'format returns the changed files and cleans up the merged temp config on success',
  },
  {
    fn: async () =>
      serialized(async () => {
        const originalBin = getOxfmtBin()
        const originalScenario = process.env.FAKE_OXFMt_SCENARIO
        setOxfmtBin(fakeOxfmt)
        process.env.FAKE_OXFMt_SCENARIO = 'check=clean'
        try {
          let threw = false
          try {
            await format({ include: 'nonexistent', fileTypes: 'js' })
          } catch {
            threw = true
          }
          return threw
        } finally {
          setOxfmtBin(originalBin)
          if (originalScenario === undefined) {
            delete process.env.FAKE_OXFMt_SCENARIO
          } else {
            process.env.FAKE_OXFMt_SCENARIO = originalScenario
          }
        }
      }),
    expect: true,
    info: 'format rejects when fileTypes is a string instead of an array',
  },
  {
    fn: async () => {
      const { code } = await runCli(['node', 'bin.js', 'f', '-v'], 'check=clean')
      return code === 0
    },
    expect: true,
    info: 'run -v without oxfmt stderr still exits 0',
  },
  {
    fn: async () => {
      const { code } = await runCli(['node', 'bin.js', 'f', '-w', '-v'], 'check=list,write=clean')
      return code === 0
    },
    expect: true,
    info: 'run -w -v without write stderr exits 0',
  },
  {
    fn: async () =>
      serialized(async () => {
        const originalBin = getOxfmtBin()
        const originalScenario = process.env.FAKE_OXFMt_SCENARIO
        setOxfmtBin(fakeOxfmt)
        process.env.FAKE_OXFMt_SCENARIO = 'check=sigkill'
        try {
          const { runOxfmt } = await import('../src/lib/runOxfmt.js')
          const result = await runOxfmt(['--list-different', '.'], process.cwd())
          return result.code === 1 && result.stdout === '' && result.stderr === ''
        } finally {
          setOxfmtBin(originalBin)
          if (originalScenario === undefined) {
            delete process.env.FAKE_OXFMt_SCENARIO
          } else {
            process.env.FAKE_OXFMt_SCENARIO = originalScenario
          }
        }
      }),
    expect: true,
    info: 'runOxfmt resolves code 1 when the oxfmt process is killed by a signal',
  },
  {
    fn: async () =>
      serialized(async () => {
        const originalBin = getOxfmtBin()
        const originalScenario = process.env.FAKE_OXFMt_SCENARIO
        setOxfmtBin('/nonexistent/path/to/oxfmt')
        if (originalScenario === undefined) {
          delete process.env.FAKE_OXFMt_SCENARIO
        }
        try {
          const { runOxfmt } = await import('../src/lib/runOxfmt.js')
          const result = await runOxfmt(['--list-different', '.'], process.cwd())
          // the node executable starts fine; the missing script makes it exit 1
          return result.code === 1 && result.stderr.trim().length > 0
        } finally {
          setOxfmtBin(originalBin)
          if (originalScenario === undefined) {
            delete process.env.FAKE_OXFMt_SCENARIO
          } else {
            process.env.FAKE_OXFMt_SCENARIO = originalScenario
          }
        }
      }),
    expect: true,
    info: 'runOxfmt reports a non-zero exit when the configured oxfmt binary does not exist',
  },
  {
    fn: async () => {
      const { code } = await runCli(['node', 'bin.js', 'f'], 'check=error-silent')
      return code === 2
    },
    expect: true,
    info: 'run exits 2 with a fallback message when oxfmt reports errors without stderr',
  },
  {
    fn: async () => {
      const { code } = await runCli(
        ['node', 'bin.js', 'f', '-w'],
        'check=list,write=write-error-silent',
      )
      return code === 2
    },
    expect: true,
    info: 'run -w exits 2 with a fallback message when the write pass reports errors without stderr',
  },
  {
    fn: async () =>
      serialized(async () => {
        const originalBin = getOxfmtBin()
        const originalScenario = process.env.FAKE_OXFMt_SCENARIO
        setOxfmtBin(fakeOxfmt)
        process.env.FAKE_OXFMt_SCENARIO = 'check=list,write=write-error-silent'
        try {
          const result = await format({
            include: 'nonexistent',
            fileTypes: ['js'],
            write: true,
          })
          return Array.isArray(result) && result.length === 0
        } finally {
          setOxfmtBin(originalBin)
          if (originalScenario === undefined) {
            delete process.env.FAKE_OXFMt_SCENARIO
          } else {
            process.env.FAKE_OXFMt_SCENARIO = originalScenario
          }
        }
      }),
    expect: true,
    info: 'format returns [] with a fallback message when the write pass reports errors without stderr',
  },
  {
    fn: async () => {
      const dir = path.join(process.cwd(), 'test', '.binCircularConfig')
      await fs.mkdir(dir, { recursive: true })
      await fs.writeFile(
        path.join(dir, 'circular.js'),
        'const c = {}\nc.self = c\nexport default c\n',
      )
      try {
        const { spawn } = await import('node:child_process')
        const code = await new Promise(resolve => {
          const child = spawn(
            process.execPath,
            [path.join(process.cwd(), 'src', 'bin.js'), 'f', '-c', 'circular.js'],
            {
              cwd: dir,
            },
          )
          child.on('close', c => resolve(c ?? 1))
          child.on('error', () => resolve(1))
        })
        return code === 1
      } finally {
        await fs.rm(dir, { recursive: true, force: true })
      }
    },
    expect: true,
    info: 'f exits 1 when the user config cannot be serialized (circular reference)',
  },
]
