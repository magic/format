#!/usr/bin/env node

import path from 'node:path'

import cli from '@magic/cli'
import log from '@magic/log'
import fs from '@magic/fs'

import format from './index.mjs'

const fileTypes = [
  'mjs',
  'js',
  'ts',
  'json',
  'jsx',
  'tsx',
  'markdown',
  'md',
  'css',
  'scss',
  'sass',
  'gltf',
]

const optional = {
  haml: ['@prettier', 'plugin-haml'],
  lua: ['@prettier', 'plugin-lua'],
  php: ['@prettier', 'plugin-php'],
  pug: ['@prettier', 'plugin-pug'],
  py: ['@prettier', 'plugin-python'],
  rb: ['@prettier', 'plugin-ruby'],
  gemspec: ['@prettier', 'plugin-ruby'],
  xml: ['@prettier', 'plugin-xml'],
  toml: ['@voltiso', 'prettier-plugin-toml'],
  java: ['prettier-plugin-java'],
  astro: ['prettier-plugin-astro'],
  svelte: ['prettier-plugin-svelte'],
}

const nodeModuleDir = path.join(process.cwd(), 'node_modules')

let changedFiles
const plugins = []

const checkOptionalDependencies = async ([extension, pathParts]) => {
  const extensionPath = path.join(nodeModuleDir, ...pathParts)
  const exists = await fs.exists(extensionPath)

  if (exists) {
    fileTypes.push(extension)
    plugins.push(pathParts.join('/'))
  }
}

const run = async () => {
  await Promise.all(Object.entries(optional).map(checkOptionalDependencies))

  const { args } = cli({
    options: [
      ['--write', '--w', '-w'],
      ['--exclude', '--e', '-e'],
      ['--file-types', '--fileTypes', '-f'],
      ['--config', '--conf', '-c'],
      ['--silent', '-s'],
      ['--plugins'],
    ],
    default: {
      '--list-different': [],
      '--file-types': fileTypes,
      '--plugins': plugins,
      '--exclude': ['node_modules', '.nyc_output'],
    },
    single: ['--config', '--silent'],
    help: {
      name: '@magic/format',
      header: 'format js code using prettier',
      options: {
        '--write': 'overwrite files in place',
        '--file-types': 'file types to format.',
        '--conf': 'path to config file',
        '--exclude': 'paths to exclude.',
        '--silent': 'only log changes',
        '--plugins': 'array of prettier plugins to load',
      },
      example: `
f     - only --list-different files
f -w  - overwrite files in place
`.trim(),
    },
  })

  changedFiles = await format(args)

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

  process.exit()
}

run()

const signals = ['SIGINT', 'SIGTERM']

signals.forEach(signal => {
  process.on(signal, async code => {
    if (typeof changedFiles !== undefined) {
      log.warn('About to exit', 'waiting for files to write...')
      await changedFiles
    }

    process.exit()
  })
})
