import path from 'path'
import fs from '@magic/fs'
import { loadConfig } from '../src/loadConfig.js'

const createMockConfig = async (dir, content) => {
  const configPath = path.join(dir, 'prettier.config.js')
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(configPath, content)
  return configPath
}

const cleanMockDir = async dir => {
  await fs.rm(dir, { recursive: true, force: true })
}

export default [
  {
    fn: async () => {
      const result = await loadConfig({})
      return result.semi === false && result.printWidth === 100
    },
    expect: true,
    info: 'loadConfig returns default config',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.loadConfig1')
      const configPath = await createMockConfig(
        testDir,
        'export const config = { semi: true, printWidth: 80, parser: "babel" }',
      )
      const result = await loadConfig({ args: { config: configPath }, cwd: testDir })
      await cleanMockDir(testDir)
      return result.semi === true && result.printWidth === 80
    },
    expect: true,
    info: 'loadConfig loads custom config file',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.loadConfig2')
      await createMockConfig(testDir, 'export const config = { semi: true, parser: "babel" }')
      const result = await loadConfig({ args: { config: 'prettier.config.js' }, cwd: testDir })
      await cleanMockDir(testDir)
      return result.semi === true
    },
    expect: true,
    info: 'loadConfig resolves relative config path',
  },
  {
    fn: async () => {
      const result = await loadConfig({ args: { config: 'nonexistent.config.js' } })
      return result.semi === false
    },
    expect: true,
    info: 'loadConfig returns default when config not found',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.loadConfig3')
      const configPath = await createMockConfig(testDir, 'export default = invalid js')
      const result = await loadConfig({ args: { config: configPath }, cwd: testDir })
      await cleanMockDir(testDir)
      return result.semi === false
    },
    expect: true,
    info: 'loadConfig returns default on config error',
  },
  {
    fn: async () => {
      const result = await loadConfig({ args: { plugins: ['prettier-plugin-sh'] } })
      return result.plugins.includes('prettier-plugin-sh')
    },
    expect: true,
    info: 'loadConfig adds plugins to default config',
  },
  {
    fn: async () => {
      const testDir = path.join(process.cwd(), 'test', '.loadConfig4')
      const configPath = await createMockConfig(
        testDir,
        'export const config = { semi: true, parser: "babel", plugins: [] }',
      )
      const result = await loadConfig({
        args: { config: configPath, plugins: ['prettier-plugin-sh'] },
        cwd: testDir,
      })
      await cleanMockDir(testDir)
      return result.plugins.includes('prettier-plugin-sh')
    },
    expect: true,
    info: 'loadConfig adds plugins to custom config',
  },
]
