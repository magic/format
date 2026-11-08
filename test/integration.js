import { spawn } from 'node:child_process'
import path from 'path'
import fs from '@magic/fs'

const binPath = path.join(process.cwd(), 'src', 'bin.js')

/** @type {(fixture: string, files: Record<string, string>) => Promise<void>} */
const createFixture = async (fixture, files) => {
  await fs.mkdir(fixture, { recursive: true })
  for (const [file, content] of Object.entries(files)) {
    const filePath = path.join(fixture, file)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, content)
  }
}

/** @type {string} */
const stripAnsi = text => {
  let result = ''
  let i = 0
  while (i < text.length) {
    if (text.charCodeAt(i) === 0x1b) {
      // ESC encountered, skip the escape sequence
      i++ // skip ESC
      if (i < text.length && text.charCodeAt(i) === 0x5b) {
        i++ // skip '['
        // skip parameter bytes (digits and semicolons)
        while (
          (i < text.length && text.charCodeAt(i) >= 0x30 && text.charCodeAt(i) <= 0x39) ||
          text.charCodeAt(i) === 0x3b
        ) {
          i++
        }
        // skip final byte (usually a letter)
        if (i < text.length) {
          i++ // skip final byte
        }
      }
      // if not CSI, we have already skipped ESC; just continue
    } else {
      result += text[i]
      i++
    }
  }
  return result
}

/**
 * Runs f in the given directory
 * @param {string} dir
 * @param {string[]} flags
 * @returns {Promise<{code: number, stdout: string, stderr: string}>}
 */
const runF = (dir, flags) =>
  new Promise(resolve => {
    const child = spawn(process.execPath, [binPath, 'f', ...flags], {
      cwd: dir,
      timeout: 30000,
    })

    /** @type {string[]} */
    const stdout = []
    /** @type {string[]} */
    const stderr = []

    child.stdout.on('data', chunk => stdout.push(String(chunk)))
    child.stderr.on('data', chunk => stderr.push(String(chunk)))
    child.on('close', code =>
      resolve({
        code: code ?? 1,
        stdout: stripAnsi(stdout.join('')),
        stderr: stripAnsi(stderr.join('')),
      }),
    )
    child.on('error', () => resolve({ code: 1, stdout: '', stderr: 'failed to start f' }))
  })

const cleanDir = async dir => {
  await fs.rm(dir, { recursive: true, force: true })
}

const fixtureDir = name => path.join(process.cwd(), 'test', `.integration-${name}`)

export default [
  {
    fn: async () => {
      const dir = fixtureDir('check')
      await createFixture(dir, { 'src/a.js': 'const a=1;' })
      try {
        const { code, stdout } = await runF(dir, [])
        const lines = stdout
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean)
        return code === 1 && lines.includes('src/a.js')
      } finally {
        await cleanDir(dir)
      }
    },
    expect: true,
    info: 'integration: f lists unformatted files and exits 1',
  },
  {
    fn: async () => {
      const dir = fixtureDir('clean')
      await createFixture(dir, { 'src/a.js': 'const a = 1\n' })
      try {
        const { code, stdout } = await runF(dir, [])
        const lines = stdout
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean)
        return code === 0 && !lines.some(l => l.includes('.js'))
      } finally {
        await cleanDir(dir)
      }
    },
    expect: true,
    info: 'integration: f exits 0 when everything is formatted',
  },
  {
    fn: async () => {
      const dir = fixtureDir('write')
      await createFixture(dir, { 'a.js': "const q='a';" })
      try {
        const { code } = await runF(dir, ['-w'])
        const content = await fs.readFile(path.join(dir, 'a.js'), 'utf8')
        return code === 0 && content === "const q = 'a'\n"
      } finally {
        await cleanDir(dir)
      }
    },
    expect: true,
    info: 'integration: f -w formats files with the shared config',
  },
  {
    fn: async () => {
      const dir = fixtureDir('parse-error')
      await createFixture(dir, { 'bad.js': 'const b = {' })
      try {
        const { code, stderr } = await runF(dir, [])
        return code === 2 && /Expected/.test(stderr)
      } finally {
        await cleanDir(dir)
      }
    },
    expect: true,
    info: 'integration: f exits 2 on parse errors',
  },
  {
    fn: async () => {
      const dir = fixtureDir('exclude')
      await createFixture(dir, { 'docs/a.js': 'const a=1;', 'src/b.js': 'const b=1;' })
      try {
        const { stdout } = await runF(dir, ['-e', 'docs'])
        const lines = stdout
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean)
        return lines.includes('src/b.js') && !lines.includes('docs/a.js')
      } finally {
        await cleanDir(dir)
      }
    },
    expect: true,
    info: 'integration: f --exclude skips excluded dirs',
  },
  {
    fn: async () => {
      const dir = fixtureDir('file-types')
      await createFixture(dir, { 'a.js': 'const a=1;', 'b.css': '.b{color:red}' })
      try {
        const { stdout } = await runF(dir, ['-f', 'js'])
        const lines = stdout
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean)
        return lines.includes('a.js') && !lines.some(l => l.endsWith('.css'))
      } finally {
        await cleanDir(dir)
      }
    },
    expect: true,
    info: 'integration: f --file-types limits the formatted file types',
  },
  {
    fn: async () => {
      const dir = fixtureDir('consumer-config')
      await createFixture(dir, {
        '.oxfmtrc.json': '{"singleQuote": false}',
        'a.js': "const q='a';",
      })
      try {
        await runF(dir, ['-w'])
        const content = await fs.readFile(path.join(dir, 'a.js'), 'utf8')
        return content === 'const q = "a"\n'
      } finally {
        await cleanDir(dir)
      }
    },
    expect: true,
    info: 'integration: f merges the consumer own oxfmt config over the shared config',
  },
  {
    fn: async () => {
      const dir = fixtureDir('explicit-config')
      await createFixture(dir, {
        'myconfig.json': '{"singleQuote": false}',
        'a.js': "const q='a';",
      })
      try {
        await runF(dir, ['-c', 'myconfig.json', '-w'])
        const content = await fs.readFile(path.join(dir, 'a.js'), 'utf8')
        return content === 'const q = "a"\n'
      } finally {
        await cleanDir(dir)
      }
    },
    expect: true,
    info: 'integration: f --config merges the given config over the shared config',
  },
]
