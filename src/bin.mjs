#!/usr/bin/env node

import path from 'path'

import prettier from 'prettier'

import { cli } from '@magic/cli'
import deep from '@magic/deep'
import fs from '@magic/fs'
import log from '@magic/log'
import is from '@magic/types'

const cwd = process.cwd()

const findFiles = async ({ include, exclude, fileTypes }) => {
  const files = await Promise.all(
    include.map(async dir => {
      if (dir.startsWith('.')) {
        return
      }

      const stat = await fs.stat(dir)
      let files = []
      if (stat.isDirectory()) {
        let dirContent = await fs.readdir(dir)
        dirContent = dirContent
          .filter(file => !file.startsWith('.'))
          .filter(file => !exclude.some(e => file === e || `${file}/`.startsWith(`${e}/`)))
          .filter(file => !file.includes('.') || fileTypes.some(ft => file.endsWith(ft)))

        files = await Promise.all(
          dirContent.map(a => findFiles({ include: [path.join(dir, a)], exclude, fileTypes })),
        )
      } else if (stat.isFile()) {
        if (fileTypes.some(f => dir.endsWith(f))) {
          files.push(dir)
        }
      }

      return files
    }),
  )

  return deep.flatten(files)
}

const init = async () => {
  const { argv, args } = cli({
    options: [
      ['--write', '--w', '-w'],
      ['--exclude', '--e', '-e'],
      ['--file-types', '--fileTypes', '-f'],
      ['--config', '--conf', '-c'],
    ],
    default: {
      '--list-different': [],
      '--file-types': ['mjs', 'json'],
      '--exclude': ['node_modules', '.nyc_output'],
    },
    help: {
      name: '@magic/test f',
      header: 'format js code using prettier',
      options: {
        '--write': 'overwrite files in place',
        '--file-types': 'file types to format.',
        '--conf': 'path to config file',
        '--exclude': 'directories and files to exclude.',
      },
      example: `
  f     - only --list-different files
  f -w  - overwrite files in place
`.trim(),
    },
  })

  let include = ''
  if (args.include) {
    include = args.include
  } else {
    include = [cwd]
  }

  const gitignore = await fs.readFile(path.join(cwd, '.gitignore'), 'utf8')
  const gitignoreArray = gitignore.split('\n').filter(a => a)

  let exclude = gitignoreArray
  if (args.exclude) {
    if (is.array(args.exclude)) {
      exclude = [...exclude, ...args.exclude]
    } else {
      exclude = [...exclude, args.exclude]
    }
  }

  exclude = Array.from(new Set(exclude))

  let fileTypes = ['js', 'json']
  if (args.fileTypes) {
    fileTypes = args.fileTypes
  }

  const files = await findFiles({ include, exclude, fileTypes })

  const pkgContent = await fs.readFile(path.join(cwd, 'package.json'), 'utf8')
  const { name } = JSON.parse(pkgContent)

  let configPath = ''

  if (args.config) {
    configPath = args.config[0]

    if (!path.isAbsolute(configPath)) {
      configPath = path.join(cwd, configPath)
    }
  }

  const confExists = await fs.exists(configPath)

  if (!confExists) {
    const confFile = path.join('src', 'defaultConfig.mjs')
    if (name === '@magic/format') {
      configPath = path.join(cwd, confFile)
    } else {
      configPath = path.join(cwd, 'node_modules', '@magic', 'format', confFile)
    }
  }

  const { config } = await import(configPath)

  let changedFiles = await Promise.all(
    files.map(async file => {
      const content = await fs.readFile(file, 'utf8')

      const changed = prettier.format(content, { ...config, filepath: file })

      if (content !== changed) {
        if (args.write) {
          await fs.writeFile(file, changed)
        }
        return file
      }
    }),
  )

  changedFiles = changedFiles.filter(a => a)

  log.info('format:')

  if (changedFiles.length) {
    let title = 'files that need formatting:'
    if (args.write) {
      title = 'changed files:'
    }

    log.annotate(title)
    log.warn(changedFiles.join('\n'))
  } else {
    log.success('no changes needed')
  }
}

init()
