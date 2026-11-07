import path from 'path'
import fs from '@magic/fs'
import { optionalLanguages, detectOptionalLanguages } from '../src/languages.js'

const cleanDir = async dir => {
  await fs.rm(dir, { recursive: true, force: true })
}

const createFakeNodeModules = async (dir, packages) => {
  for (const pkg of packages) {
    const pkgDir = path.join(dir, pkg)
    await fs.mkdir(pkgDir, { recursive: true })
    await fs.writeFile(path.join(pkgDir, 'package.json'), '{}')
  }
  return dir
}

export default [
  {
    fn: () => {
      const keys = Object.keys(optionalLanguages)
      return keys.includes('svelte') && keys.includes('astro')
    },
    expect: true,
    info: 'optionalLanguages includes svelte and astro',
  },
  {
    fn: async () => {
      const nmDir = path.join(process.cwd(), 'test', '.languages1', 'node_modules')
      const result = await detectOptionalLanguages(nmDir)
      await cleanDir(path.join(process.cwd(), 'test', '.languages1'))
      return result.fileTypes.length === 0 && Object.keys(result.config).length === 0
    },
    expect: true,
    info: 'detectOptionalLanguages returns empty for empty node_modules',
  },
  {
    fn: async () => {
      const nmDir = path.join(process.cwd(), 'test', '.languages2', 'node_modules')
      await createFakeNodeModules(nmDir, ['svelte'])
      try {
        const result = await detectOptionalLanguages(nmDir)
        return result.fileTypes.includes('svelte') && result.config.svelte === true
      } finally {
        await cleanDir(path.join(process.cwd(), 'test', '.languages2'))
      }
    },
    expect: true,
    info: 'detectOptionalLanguages detects svelte',
  },
  {
    fn: async () => {
      const nmDir = path.join(process.cwd(), 'test', '.languages3', 'node_modules')
      await createFakeNodeModules(nmDir, ['@astrojs/compiler-rs'])
      try {
        const result = await detectOptionalLanguages(nmDir)
        return result.fileTypes.includes('astro') && result.config.astro === true
      } finally {
        await cleanDir(path.join(process.cwd(), 'test', '.languages3'))
      }
    },
    expect: true,
    info: 'detectOptionalLanguages detects astro',
  },
  {
    fn: async () => {
      const nmDir = path.join(process.cwd(), 'test', '.languages4', 'node_modules')
      await createFakeNodeModules(nmDir, ['svelte', '@astrojs/compiler-rs'])
      try {
        const result = await detectOptionalLanguages(nmDir)
        return result.fileTypes.length === 2 && result.config.svelte && result.config.astro
      } finally {
        await cleanDir(path.join(process.cwd(), 'test', '.languages4'))
      }
    },
    expect: true,
    info: 'detectOptionalLanguages detects multiple languages',
  },
]
