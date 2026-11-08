import fs from '@magic/fs'

import { parseJsonc } from './parseJsonc.js'

/**
 * Reads a user config file as a plain object.
 * Returns null when the file cannot be parsed here
 * (e.g. typescript configs), so the caller can
 * fall back to letting oxfmt handle it natively.
 * @param {string} file
 * @returns {Promise<Record<string, any>|null>}
 */
export const readUserConfig = async file => {
  try {
    if (file.endsWith('.json') || file.endsWith('.jsonc')) {
      return parseJsonc(await fs.readFile(file, 'utf8'))
    }

    if (/\.(js|mjs|cjs)$/.test(file)) {
      const module = await import(file)
      const config = module.config ?? module.default
      if (config && typeof config === 'object') {
        return config
      }
    }

    return null
  } catch {
    return null
  }
}
