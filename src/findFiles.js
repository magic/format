/// <reference path="./types.d.ts" />

import path from 'path'

import deep from '@magic/deep'
import fs from '@magic/fs'
import log from '@magic/log'
import is from '@magic/types'

/**
 * Checks if a file should be ignored based on exclude patterns
 * @param {{dir: string, exclude: string[], file: string}} params
 * @returns {boolean}
 */
const shouldIgnore = ({ dir, exclude, file }) => {
  return !exclude.some(e => {
    const fullExclude = path.join(dir, e)
    return file.startsWith(fullExclude)
  })
}

/**
 * Finds all files matching the given criteria
 * @param {FindFilesParams} params
 * @returns {Promise<string[]>}
 */
export const findFiles = async ({
  include = [],
  exclude = [],
  fileTypes = [],
  verbose = false,
}) => {
  if (is.string(include)) {
    include = [include]
  }

  if (is.string(exclude)) {
    exclude = [exclude]
  }

  if (!exclude.includes('.git')) {
    exclude.push('.git')
  }

  const files = await Promise.all(
    include.map(async dir => {
      const dirFiles = await fs.getFiles(dir)

      return dirFiles
        .filter(file => file.includes('.'))
        .filter(file => fileTypes.some(ft => file.endsWith(ft)))
        .filter(file => shouldIgnore({ dir, exclude, file }))
    }),
  )

  // @ts-ignore - deep.flatten returns the correct flattened type
  const flat = /** @type {string[]} */ (deep.flatten(files))

  if (verbose) {
    log.warn('format', 'checking files:')
    flat.forEach(file => log.info(file.replace(process.cwd(), '.')))
  }

  return flat
}
