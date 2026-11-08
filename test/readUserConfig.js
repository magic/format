import fs from '@magic/fs'
import path from 'path'
import crypto from 'node:crypto'

import { readUserConfig } from '../src/lib/readUserConfig.js'

const testDir = path.join(process.cwd(), 'test', '.userConfig')

/**
 * Creates a uniquely-named file in the shared temp dir.
 * Each test only ever removes its own file, so parallel tests
 * never interfere with each other.
 * @param {string} filename
 * @param {string} content
 * @returns {Promise<string>}
 */
const createTempFile = async (filename, content) => {
  await fs.mkdir(testDir, { recursive: true })
  const unique = crypto.randomBytes(4).toString('hex')
  const filePath = path.join(testDir, `${unique}-${filename}`)
  await fs.writeFile(filePath, content)
  return filePath
}

/** @type {any[]} */
export default [
  {
    fn: async () => {
      const configPath = await createTempFile('config.json', '{"a": 1}')
      try {
        const result = await readUserConfig(configPath)
        return result && result.a === 1
      } finally {
        await fs.rm(configPath, { force: true })
      }
    },
    expect: true,
    info: 'readUserConfig parses a .json config file',
  },
  {
    fn: async () => {
      const configPath = await createTempFile('config.jsonc', '// comment\n{"b": 2}')
      try {
        const result = await readUserConfig(configPath)
        return result && result.b === 2
      } finally {
        await fs.rm(configPath, { force: true })
      }
    },
    expect: true,
    info: 'readUserConfig parses a .jsonc config file with comments',
  },
  {
    fn: async () => {
      const configPath = await createTempFile('config.js', 'export default { c: 3 }')
      try {
        const result = await readUserConfig(configPath)
        return result && result.c === 3
      } finally {
        await fs.rm(configPath, { force: true })
      }
    },
    expect: true,
    info: 'readUserConfig parses a .js config file with a default export',
  },
  {
    fn: async () => {
      const configPath = await createTempFile('config.js', 'export const config = { d: 4 }')
      try {
        const result = await readUserConfig(configPath)
        return result && result.d === 4
      } finally {
        await fs.rm(configPath, { force: true })
      }
    },
    expect: true,
    info: 'readUserConfig parses a .js config file with a named config export',
  },
  {
    fn: async () => {
      const configPath = await createTempFile('config.js', 'export const e = 5')
      try {
        const result = await readUserConfig(configPath)
        return result === null
      } finally {
        await fs.rm(configPath, { force: true })
      }
    },
    expect: true,
    info: 'readUserConfig returns null for a .js config with no usable export',
  },
  {
    fn: async () => {
      const configPath = await createTempFile('config.js', 'export default 5')
      try {
        const result = await readUserConfig(configPath)
        return result === null
      } finally {
        await fs.rm(configPath, { force: true })
      }
    },
    expect: true,
    info: 'readUserConfig returns null when the config is not an object',
  },
  {
    fn: async () => {
      const configPath = await createTempFile('unknown.xyz', 'not a config')
      try {
        const result = await readUserConfig(configPath)
        return result === null
      } finally {
        await fs.rm(configPath, { force: true })
      }
    },
    expect: true,
    info: 'readUserConfig returns null for a file with an unknown extension',
  },
  {
    fn: async () => {
      const configPath = await createTempFile('config.json', 'not valid json')
      try {
        const result = await readUserConfig(configPath)
        return result === null
      } finally {
        await fs.rm(configPath, { force: true })
      }
    },
    expect: true,
    info: 'readUserConfig returns null when the json content is invalid',
  },
  {
    fn: async () => {
      const missing = path.join(process.cwd(), 'test', '.userConfig', 'never-created.json')
      const result = await readUserConfig(missing)
      return result === null
    },
    expect: true,
    info: 'readUserConfig returns null when the file does not exist',
  },
]
