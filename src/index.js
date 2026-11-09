/// <reference path="./types.ts" />

import fs from '@magic/fs'
import is from '@magic/types'
import log from '@magic/log'

import { resolveConfig, runOxfmt, buildOxfmtArgs } from './lib.js'

export * from './lib.js'

/**
 * Formats code files using the oxfmt cli.
 * oxfmt takes care of file discovery, config resolution
 * and gitignore handling.
 * @param {import("./types.js").FormatParams} [args]
 * @returns {Promise<string[]>} - Array of changed file paths
 */
export const format = async (args = {}) => {
  const cwd = process.cwd()

  let include = args.include || [cwd]
  if (!is.array(include)) {
    include = [include]
  }

  const exclude = args.exclude ? (is.array(args.exclude) ? args.exclude : [args.exclude]) : []

  const { file: configFile, temp } = await resolveConfig(args, cwd)

  try {
    const checkArgs = buildOxfmtArgs({
      args: { ...args, exclude, write: false },
      paths: include,
      configFile,
    })

    const check = await runOxfmt(checkArgs, cwd)

    // exit 0 means nothing needs formatting (stdout may carry summary lines)
    if (check.code === 0) {
      return []
    }

    if (check.code !== 1) {
      log.error(
        'FORMAT_ERROR',
        'oxfmt reported errors:',
        check.stderr.trim() || `exit code ${check.code}`,
      )
      return []
    }

    const changedFiles = check.stdout
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)

    if (!changedFiles.length && check.stderr.trim()) {
      log.error('FORMAT_ERROR', 'oxfmt failed:', check.stderr.trim())
      return []
    }

    if (args.write && changedFiles.length) {
      const writeArgs = buildOxfmtArgs({ args: { ...args, exclude }, paths: include, configFile })
      const write = await runOxfmt(writeArgs, cwd)

      if (write.code !== 0 && (write.code === 2 || write.stderr.trim())) {
        log.error('FORMAT_ERROR', 'oxfmt reported errors:', write.stderr.trim() || 'oxfmt failed')
        return []
      }
    }

    return changedFiles
  } finally {
    if (temp) {
      await fs.unlink(configFile).catch(() => {})
    }
  }
}
