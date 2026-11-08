#!/usr/bin/env node

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import cli from '@magic/cli'
import fs from '@magic/fs'
import log from '@magic/log'

import { buildOxfmtArgs, getOxfmtBin, resolveConfig, runOxfmt } from './lib.js'

/**
 * f flags that consume the next argument as their value
 * @type {string[]}
 */
const valueFlags = [
  '--exclude',
  '--e',
  '-e',
  '--file-types',
  '--fileTypes',
  '-f',
  '--config',
  '--conf',
  '-c',
]

/**
 * Collects bare positional path arguments from the given argv
 * @param {string[]} [argv=process.argv]
 * @returns {string[]}
 */
export const getPaths = (argv = process.argv) => {
  /** @type {string[]} */
  const paths = []

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]

    if (arg === 'f' || arg === 'format') {
      continue
    }

    if (valueFlags.includes(arg)) {
      i++
      continue
    }

    if (arg.startsWith('-')) {
      continue
    }

    paths.push(arg)
  }

  return paths
}

/**
 * Main CLI entry point
 * @returns {Promise<number>} - the exit code
 */
export const run = async () => {
  const { args } = cli({
    options: [
      ['--write', '--w', '-w'],
      ['--exclude', '--e', '-e'],
      ['--file-types', '--fileTypes', '-f'],
      ['--config', '--conf', '-c'],
      ['--silent', '-s'],
      ['--verbose', '-v'],
    ],
    default: {
      '--exclude': ['.nyc_output'],
    },
    single: ['--config', '--silent', '--verbose'],
    help: {
      name: '@magic/format',
      header: 'format code using oxfmt',
      options: {
        '--write': 'overwrite files in place',
        '--file-types': 'only format the given file types.',
        '--conf':
          'path to config file. if not given, the oxfmt config of the project is used, or the config shared by @magic/format.',
        '--exclude': 'paths to exclude.',
        '--silent': 'only log changes',
        '--verbose': 'echo the oxfmt command and its output',
      },
      example: `
f [paths]          - list files that need formatting
f -w [paths]       - format files in place
f --exclude docs   - exclude the docs directory
`.trim(),
    },
  })

  const cwd = process.cwd()
  const { file: configFile, temp } = await resolveConfig(args, cwd)

  const cleanTemp = async () => {
    if (temp) {
      await fs.unlink(configFile).catch(() => {})
    }
  }

  const paths = getPaths().length ? getPaths() : [cwd]
  const checkArgs = buildOxfmtArgs({ args: { ...args, write: false }, paths, configFile })

  if (args.verbose) {
    log.warn('format', `running: ${process.execPath} ${getOxfmtBin()} ${checkArgs.join(' ')}`)
  }

  const check = await runOxfmt(checkArgs, cwd)
  const changedFiles = check.stdout
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)

  if (args.verbose && check.stderr.trim()) {
    log.warn('oxfmt:', check.stderr.trim())
  }

  // oxfmt exited 1 ("files differ") without listing any file: it crashed
  if (check.code === 1 && !changedFiles.length && check.stderr.trim()) {
    log.error('FORMAT_ERROR', 'oxfmt failed:', check.stderr.trim())
    await cleanTemp()
    return 1
  }

  let exitCode

  if (args.write) {
    if (changedFiles.length) {
      const writeArgs = buildOxfmtArgs({ args, paths, configFile })
      const write = await runOxfmt(writeArgs, cwd)

      if (args.verbose && write.stderr.trim()) {
        log.warn('oxfmt:', write.stderr.trim())
      }

      log.info('format:')
      log.annotate('changed files:')
      log(changedFiles.join('\n'))

      if (write.code === 2) {
        log.error(
          'FORMAT_ERROR',
          'oxfmt reported errors:',
          write.stderr.trim() || 'see oxfmt output',
        )
        exitCode = 2
      } else if (write.code !== 0 && write.stderr.trim()) {
        log.error('FORMAT_ERROR', 'oxfmt failed:', write.stderr.trim())
        exitCode = write.code
      } else {
        exitCode = 0
      }
    } else {
      if (!args.silent) {
        log.success('format', 'no changes needed')
      }
      exitCode = 0
    }
  } else {
    if (changedFiles.length) {
      log.info('format:')
      log.annotate('files that need formatting:')
      log(changedFiles.join('\n'))
      exitCode = 1
    } else {
      if (!args.silent) {
        log.success('format', 'no changes needed')
      }
      exitCode = 0
    }

    if (check.code === 2) {
      log.error('FORMAT_ERROR', 'oxfmt reported errors:', check.stderr.trim() || 'see oxfmt output')
      exitCode = 2
    }
  }

  await cleanTemp()
  return exitCode
}

// only run when executed directly, not when imported (e.g. by tests)
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  try {
    const code = await run()
    process.exit(code ?? 0)
  } catch (error) {
    log.error(error)
    process.exit(1)
  }
}
