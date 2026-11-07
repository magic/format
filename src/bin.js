#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import cli from '@magic/cli'
import fs from '@magic/fs'
import is from '@magic/types'
import log from '@magic/log'

import { resolveConfigFile } from './config.js'

const require = createRequire(import.meta.url)

/** @type {string|undefined} */
let testOxfmtBin

/**
 * Overrides the oxfmt binary, for testing
 * @param {string|undefined} bin
 */
export const setTestOxfmtBin = bin => {
  testOxfmtBin = bin
}

/**
 * Resolves the oxfmt binary shipped with our oxfmt dependency.
 * Can be overridden with the MAGIC_FORMAT_OXFMT_BIN env variable (for testing)
 * @returns {string}
 */
export const getOxfmtBin = () =>
  testOxfmtBin ||
  process.env.MAGIC_FORMAT_OXFMT_BIN ||
  path.join(path.dirname(require.resolve('oxfmt/package.json')), 'bin', 'oxfmt')

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
 * Builds the oxfmt cli argument list from f's parsed arguments
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

/**
 * Runs oxfmt with the given arguments
 * @param {string[]} oxfmtArgs
 * @param {string} cwd
 * @returns {Promise<{code: number, stdout: string, stderr: string}>}
 */
const runOxfmt = (oxfmtArgs, cwd) =>
  new Promise(resolve => {
    const child = spawn(process.execPath, [getOxfmtBin(), ...oxfmtArgs], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    /** @type {string[]} */
    const stdout = []
    /** @type {string[]} */
    const stderr = []

    child.stdout.on('data', chunk => stdout.push(String(chunk)))
    child.stderr.on('data', chunk => stderr.push(String(chunk)))

    /** @type {Record<string, () => void>} */
    const signalHandlers = {}
    for (const signal of /** @type {NodeJS.Signals[]} */ (['SIGINT', 'SIGTERM'])) {
      signalHandlers[signal] = () => {
        if (child.exitCode === null) {
          log.warn('About to exit', 'stopping oxfmt...')
          child.kill(signal)
        }
      }
      process.once(signal, signalHandlers[signal])
    }

    const finish = result => {
      for (const [signal, handler] of Object.entries(signalHandlers)) {
        process.removeListener(signal, handler)
      }
      resolve(result)
    }

    child.on('close', code =>
      finish({ code: code ?? 1, stdout: stdout.join(''), stderr: stderr.join('') }),
    )
    child.on('error', () => finish({ code: 1, stdout: '', stderr: 'failed to start oxfmt' }))
  })

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
  const { file: configFile, temp } = await resolveConfigFile({ args, cwd })

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
  run()
    .then(code => process.exit(code ?? 0))
    .catch(error => {
      log.error(error)
      process.exit(1)
    })
}
