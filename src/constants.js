import path from 'node:path'
import url from 'node:url'

/**
 * The oxfmt config shared with all consumers,
 * so they do not have to declare rules themselves
 * @type {string}
 */
export const sharedConfigPath = path.join(
  path.dirname(url.fileURLToPath(import.meta.url)),
  'oxfmt.config.js',
)

/**
 * Config file names oxfmt discovers itself,
 * starting from the formatted file and walking up the tree
 * @type {string[]}
 */
export const configFiles = [
  '.oxfmtrc.json',
  '.oxfmtrc.jsonc',
  'oxfmt.config.ts',
  'oxfmt.config.mts',
]

export const tempConfigFilePrefix = 'magic-format-'
