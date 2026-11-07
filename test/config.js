import path from 'path'
import fs from '@magic/fs'
import { loadConfig, resolveConfigFile, sharedConfigPath, parseJsonc } from '../src/config.js'

const cleanDir = async dir => {
  await fs.rm(dir, { recursive: true, force: true })
}

const createMockConfig = async (dir, content, name = 'oxfmt.config.js') => {
  const configPath = path.join(dir, name)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(configPath, content)
  return configPath
}

const createFakeNodeModules = async (dir, packages) => {
  for (const pkg of packages) {
    const pkgDir = path.join(dir, pkg)
    await fs.mkdir(pkgDir, { recursive: true })
    await fs.writeFile(path.join(pkgDir, 'package.json'), '{}')
  }
  return dir
}

const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'))

export default [
  {
    fn: async () => {
      const result = await loadConfig({})
      return result.semi === false && result.printWidth === 100 && result.singleQuote === true
    },
    expect: true,
    info: 'loadConfig returns the shared config',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.config1')
      const configPath = await createMockConfig(
        testDir,
        'export const config = { semi: true, printWidth: 80 }',
      )
      const result = await loadConfig({ args: { config: configPath }, cwd: testDir })
      await cleanDir(testDir)
      return result.semi === true && result.printWidth === 80 && result.singleQuote === true
    },
    expect: true,
    info: 'loadConfig loads custom config file and merges over shared config',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.config2')
      await createMockConfig(testDir, 'export default { semi: true }')
      const result = await loadConfig({ args: { config: 'oxfmt.config.js' }, cwd: testDir })
      await cleanDir(testDir)
      return result.semi === true
    },
    expect: true,
    info: 'loadConfig loads default export config',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.config3')
      const configPath = await createMockConfig(testDir, '{"semi": true}', 'config.json')
      const result = await loadConfig({ args: { config: configPath }, cwd: testDir })
      await cleanDir(testDir)
      return result.semi === true
    },
    expect: true,
    info: 'loadConfig loads json config file',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.config3b')
      const configPath = await createMockConfig(
        testDir,
        '// a comment\n{ /* block */ "semi": true, }',
        'config.jsonc',
      )
      const result = await loadConfig({ args: { config: configPath }, cwd: testDir })
      await cleanDir(testDir)
      return result.semi === true
    },
    expect: true,
    info: 'loadConfig loads jsonc config with comments and trailing commas',
  },
  {
    fn: async () => {
      const result = await loadConfig({ args: { config: 'nonexistent.config.js' } })
      return result.semi === false
    },
    expect: true,
    info: 'loadConfig returns shared config when config not found',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.config4')
      const configPath = await createMockConfig(testDir, 'export default = invalid js')
      const result = await loadConfig({ args: { config: configPath }, cwd: testDir })
      await cleanDir(testDir)
      return result.semi === false
    },
    expect: true,
    info: 'loadConfig returns shared config on config error',
  },
  {
    fn: async () => {
      const nmDir = path.join(process.cwd(), 'test', '.configNm1', 'node_modules')
      await createFakeNodeModules(nmDir, ['svelte'])
      try {
        const result = await loadConfig({ nodeModulesDir: nmDir })
        return result.svelte === true
      } finally {
        await cleanDir(path.join(process.cwd(), 'test', '.configNm1'))
      }
    },
    expect: true,
    info: 'loadConfig enables svelte when package is installed',
  },
  {
    fn: async () => {
      const nmDir = path.join(process.cwd(), 'test', '.configNm2', 'node_modules')
      await createFakeNodeModules(nmDir, ['@astrojs/compiler-rs'])
      try {
        const result = await loadConfig({ nodeModulesDir: nmDir })
        return result.astro === true
      } finally {
        await cleanDir(path.join(process.cwd(), 'test', '.configNm2'))
      }
    },
    expect: true,
    info: 'loadConfig enables astro when package is installed',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.config5')
      const nmDir = path.join(process.cwd(), 'test', '.configNm5', 'node_modules')
      const configPath = await createMockConfig(testDir, 'export const config = { svelte: false }')
      await createFakeNodeModules(nmDir, ['svelte'])
      try {
        const result = await loadConfig({
          args: { config: configPath },
          cwd: testDir,
          nodeModulesDir: nmDir,
        })
        return result.svelte === false
      } finally {
        await cleanDir(testDir)
        await cleanDir(path.join(process.cwd(), 'test', '.configNm5'))
      }
    },
    expect: true,
    info: 'loadConfig does not override explicit user config',
  },
  {
    fn: async () => {
      const result = await resolveConfigFile({ args: { config: 'my.config.js' }, cwd: '/tmp' })
      // nonexistent js config cannot be parsed, so it is passed to oxfmt as-is
      return result.file === '/tmp/my.config.js' && result.temp === false
    },
    expect: true,
    info: 'resolveConfigFile passes unparseable configs to oxfmt as-is',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.configResolve1')
      await createMockConfig(testDir, '{"printWidth": 80}', '.oxfmtrc.json')
      try {
        const result = await resolveConfigFile({ cwd: testDir })
        const config = await readJson(result.file)
        if (result.temp) await fs.rm(result.file, { force: true })
        // user value wins, shared defaults fill the rest
        return (
          result.temp === true &&
          config.printWidth === 80 &&
          config.semi === false &&
          config.singleQuote === true
        )
      } finally {
        await cleanDir(testDir)
      }
    },
    expect: true,
    info: 'resolveConfigFile merges the consumer own config over the shared config',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.configResolve2')
      await createMockConfig(
        testDir,
        '// explicit jsonc with comment and trailing comma\n{ "semi": true, }',
        'explicit.jsonc',
      )
      try {
        const result = await resolveConfigFile({ args: { config: 'explicit.jsonc' }, cwd: testDir })
        const config = await readJson(result.file)
        if (result.temp) await fs.rm(result.file, { force: true })
        return result.temp === true && config.semi === true && config.singleQuote === true
      } finally {
        await cleanDir(testDir)
      }
    },
    expect: true,
    info: 'resolveConfigFile merges an explicit jsonc config over the shared config',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.configResolveTs')
      const configPath = await createMockConfig(
        testDir,
        'export default { semi: true }',
        'config.ts',
      )
      try {
        const result = await resolveConfigFile({ args: { config: configPath }, cwd: testDir })
        return result.file === configPath && result.temp === false
      } finally {
        await cleanDir(testDir)
      }
    },
    expect: true,
    info: 'resolveConfigFile passes typescript configs to oxfmt as-is',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.configResolveBroken')
      const configPath = await createMockConfig(testDir, '{ broken json', 'broken.json')
      try {
        const result = await resolveConfigFile({ args: { config: configPath }, cwd: testDir })
        return result.file === configPath && result.temp === false
      } finally {
        await cleanDir(testDir)
      }
    },
    expect: true,
    info: 'resolveConfigFile passes broken json configs to oxfmt as-is',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.configResolve3')
      await fs.mkdir(testDir, { recursive: true })
      try {
        const result = await resolveConfigFile({ cwd: testDir })
        return result.file === sharedConfigPath && result.temp === false
      } finally {
        await cleanDir(testDir)
      }
    },
    expect: true,
    info: 'resolveConfigFile falls back to the shared config',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.configResolve4')
      const nmDir = path.join(testDir, 'node_modules')
      await fs.mkdir(testDir, { recursive: true })
      await createFakeNodeModules(nmDir, ['svelte'])
      try {
        const result = await resolveConfigFile({ cwd: testDir, nodeModulesDir: nmDir })
        const config = await readJson(result.file)
        if (result.temp) await fs.rm(result.file, { force: true })
        return result.temp === true && config.svelte === true && config.semi === false
      } finally {
        await cleanDir(testDir)
      }
    },
    expect: true,
    info: 'resolveConfigFile writes temp config with optional languages enabled',
  },
  {
    fn: () => {
      const parsed = parseJsonc('{"a": "he said \\"hi\\"", "b": 1}')
      return parsed.a === 'he said "hi"' && parsed.b === 1
    },
    expect: true,
    info: 'parseJsonc keeps escaped quotes inside strings',
  },
  {
    fn: () => {
      const parsed = parseJsonc('{ "a": 1, "b": [2, 3,] }')
      return parsed.a === 1 && parsed.b.length === 2 && parsed.b[1] === 3
    },
    expect: true,
    info: 'parseJsonc keeps middle commas and strips trailing ones',
  },
  {
    fn: () => {
      try {
        parseJsonc('{ "a": "x\\')
        return false
      } catch (e) {
        return true
      }
    },
    expect: true,
    info: 'parseJsonc throws on unterminated strings',
  },
  {
    fn: async () => {
      // an invalid cwd makes path.join throw inside loadConfig
      const result = await loadConfig({ args: { config: 'x.js' }, cwd: 123 })
      return result.semi === false && result.printWidth === 100
    },
    expect: true,
    info: 'loadConfig falls back to the shared config on unexpected errors',
  },
]
