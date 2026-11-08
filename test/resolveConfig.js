import fs from '@magic/fs'
import path from 'path'
import crypto from 'node:crypto'

import { sharedConfigPath } from '../src/constants.js'
import { resolveConfig } from '../src/lib/resolveConfig.js'

const testDir = path.join(process.cwd(), 'test', '.resolveConfig')

/**
 * Creates a uniquely-named subdirectory in the shared temp dir.
 * Each test only ever removes its own directory, so parallel
 * tests never interfere with each other.
 * @param {Record<string, string>} [files]
 * @returns {Promise<string>}
 */
const createTempDir = async files => {
  const unique = crypto.randomBytes(4).toString('hex')
  const dir = path.join(testDir, unique)
  await fs.mkdir(dir, { recursive: true })
  for (const [name, content] of Object.entries(files ?? {})) {
    await fs.writeFile(path.join(dir, name), content)
  }
  return dir
}

/** @type {any[]} */
export default [
  {
    fn: async () => {
      const dir = await createTempDir()
      try {
        const result = await resolveConfig({}, dir)
        return result.file === sharedConfigPath && result.temp === false
      } finally {
        await fs.rm(dir, { recursive: true, force: true })
      }
    },
    expect: true,
    info: 'resolveConfig returns the shared config when no user config exists',
  },
  {
    fn: async () => {
      const dir = await createTempDir({ '.oxfmtrc.json': '{"a": 1}' })
      try {
        const result = await resolveConfig({}, dir)
        if (result.temp !== true) {
          return false
        }
        const config = JSON.parse(await fs.readFile(result.file, 'utf8'))
        return config.a === 1 && config.semi === false
      } finally {
        await fs.rm(dir, { recursive: true, force: true })
      }
    },
    expect: true,
    info: 'resolveConfig merges a .oxfmtrc.json user config over the shared config',
  },
  {
    fn: async () => {
      const dir = await createTempDir({ '.oxfmtrc.jsonc': '// comment\n{"b": 2}' })
      try {
        const result = await resolveConfig({}, dir)
        return result.temp === true
      } finally {
        await fs.rm(dir, { recursive: true, force: true })
      }
    },
    expect: true,
    info: 'resolveConfig merges a .oxfmtrc.jsonc user config over the shared config',
  },
  {
    fn: async () => {
      const dir = await createTempDir({ 'oxfmt.config.ts': 'export default { c: 3 }' })
      try {
        const result = await resolveConfig({}, dir)
        return result.temp === false && result.file === path.join(dir, 'oxfmt.config.ts')
      } finally {
        await fs.rm(dir, { recursive: true, force: true })
      }
    },
    expect: true,
    info: 'resolveConfig passes an unparseable .ts user config to oxfmt as-is',
  },
  {
    fn: async () => {
      const dir = await createTempDir({
        '.oxfmtrc.json': '{"f": 6}',
        'other-config.json': '{"g": 7}',
      })
      try {
        const explicit = path.join(dir, 'other-config.json')
        const result = await resolveConfig({ config: explicit }, dir)
        if (result.temp !== true) {
          return false
        }
        const config = JSON.parse(await fs.readFile(result.file, 'utf8'))
        return config.g === 7 && config.f === undefined
      } finally {
        await fs.rm(dir, { recursive: true, force: true })
      }
    },
    expect: true,
    info: 'resolveConfig prefers an explicit --config over the discovered one',
  },
  {
    fn: async () => {
      const dir = await createTempDir({ 'relative.json': '{"h": 8}' })
      try {
        const result = await resolveConfig({ config: 'relative.json' }, dir)
        if (result.temp !== true) {
          return false
        }
        const config = JSON.parse(await fs.readFile(result.file, 'utf8'))
        return config.h === 8
      } finally {
        await fs.rm(dir, { recursive: true, force: true })
      }
    },
    expect: true,
    info: 'resolveConfig resolves a relative --config against the cwd',
  },
]
