import path from 'path'

import prettier from 'prettier'

import fs from '@magic/fs'
import is from '@magic/types'

import { findFiles } from './findFiles.mjs'

const cwd = process.cwd()

export const format = async args => {
  let include = ''
  if (args.include) {
    include = args.include
  } else {
    include = [cwd]
  }

  let exclude

  const gitIgnorePath = path.join(cwd, '.gitignore')

  if (await fs.exists(gitIgnorePath)) {
    const gitignore = await fs.readFile(gitIgnorePath, 'utf8')
    exclude = gitignore.split('\n').filter(a => a)

    if (args.exclude) {
      if (is.array(args.exclude)) {
        exclude = [...exclude, ...args.exclude]
      } else {
        exclude = [...exclude, args.exclude]
      }
    }
  } else {
    exclude = ['node_modules', 'coverage']
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

  const confExists = configPath && (await fs.exists(configPath))

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

  return changedFiles.filter(a => a)
}

export default format
