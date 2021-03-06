#!/usr/bin/env node

import cli from '@magic/cli'
import log from '@magic/log'

import format from './index.mjs'

const { args } = cli({
  options: [
    ['--write', '--w', '-w'],
    ['--exclude', '--e', '-e'],
    ['--file-types', '--fileTypes', '-f'],
    ['--config', '--conf', '-c'],
    ['--silent', '-s'],
  ],
  default: {
    '--list-different': [],
    '--file-types': ['mjs', 'json'],
    '--exclude': ['node_modules', '.nyc_output'],
  },
  help: {
    name: '@magic/format',
    header: 'format js code using prettier',
    options: {
      '--write': 'overwrite files in place',
      '--file-types': 'file types to format.',
      '--conf': 'path to config file',
      '--exclude': 'paths to exclude.',
      '--silent': 'only log changes',
    },
    example: `
f     - only --list-different files
f -w  - overwrite files in place
`.trim(),
  },
})

const run = async () => {
  const changedFiles = await format(args)

  if (changedFiles.length) {
    log.info('format:')

    let title = 'files that need formatting:'
    if (args.write) {
      title = 'changed files:'
    }

    log.annotate(title)
    log.warn(changedFiles.join('\n'))
  } else {
    if (!args.silent) {
      log.success('format', 'no changes needed')
    }
  }
}

run()
