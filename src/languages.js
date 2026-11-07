/// <reference path="./types.d.ts" />

import path from 'node:path'

import fs from '@magic/fs'

/**
 * Languages oxfmt only formats when the corresponding option is enabled
 * and the matching peer package is installed in the project
 * @type {Record<string, {ext: string, package: string}>}
 */
export const optionalLanguages = {
  svelte: { ext: 'svelte', package: 'svelte' },
  astro: { ext: 'astro', package: '@astrojs/compiler-rs' },
}

/**
 * Detects which optional languages are available,
 * based on the peer packages installed in the project
 * @param {string} [nodeModulesDir] - node_modules root to check
 * @returns {Promise<{fileTypes: string[], config: Record<string, boolean>}>}
 */
export const detectOptionalLanguages = async nodeModulesDir => {
  const root = nodeModulesDir || path.join(process.cwd(), 'node_modules')

  /** @type {string[]} */
  const fileTypes = []

  /** @type {Record<string, boolean>} */
  const config = {}

  for (const [name, { ext, package: pkg }] of Object.entries(optionalLanguages)) {
    if (await fs.exists(path.join(root, pkg))) {
      fileTypes.push(ext)
      config[name] = true
    }
  }

  return { fileTypes, config }
}
