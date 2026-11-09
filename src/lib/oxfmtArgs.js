/// <reference path="../types.ts" />

import is from '@magic/types'

/**
 * Builds the oxfmt cli argument list from parsed arguments
 * @param {{args?: Record<string, any>, paths?: string[], configFile?: string}} params
 * @returns {string[]}
 */
export const buildOxfmtArgs = ({ args = {}, paths = [], configFile } = {}) => {
  const oxfmtArgs = [args.write ? '--write' : '--list-different']

  if (configFile) {
    oxfmtArgs.push('-c', configFile)
  }

  if (args.fileTypes && args.fileTypes.length) {
    oxfmtArgs.push(`**/*.{${args.fileTypes.join(',')}}`)
  }

  oxfmtArgs.push(...paths)

  if (args.exclude) {
    const excludes = is.array(args.exclude) ? args.exclude : [args.exclude]
    for (const exclude of excludes) {
      const pattern = exclude.startsWith('!')
        ? exclude.slice(1)
        : `${String(exclude).replace(/\/+$/, '')}/**`
      oxfmtArgs.push(`!${pattern}`)
    }
  }

  oxfmtArgs.push('--no-error-on-unmatched-pattern')

  return oxfmtArgs
}
