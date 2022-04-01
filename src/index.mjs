import path from 'path'

import prettier from 'prettier'

import deep from '@magic/deep'
import fs from '@magic/fs'
import is from '@magic/types'
import log from '@magic/log'

import { findFiles } from './findFiles.mjs'
import { loadConfig } from './loadConfig.mjs'

const cwd = process.cwd()

export const format = async args => {
  let include = ''
  if (args.include) {
    if (is.string(args.include)) {
      include = [args.include]
    } else {
      include = args.include
    }
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

  exclude = Array.from(new Set(deep.flatten(exclude)))

  let fileTypes = ['js', 'json']
  if (args.fileTypes) {
    fileTypes = args.fileTypes
  }

  const files = await findFiles({ include, exclude, fileTypes })

  const config = await loadConfig(cwd, args)

  let changedFiles = await Promise.all(
    files.map(async file => {
      try {
        const content = await fs.readFile(file, 'utf8')

        const changed = prettier.format(content, { ...config, filepath: file })

        if (content !== changed) {
          if (args.write) {
            await fs.writeFile(file, changed)
          }
          return file
        }
      } catch (e) {
        log.error(e.code, e.message)
      }
    }),
  )

  return changedFiles.filter(a => a)
}

export default format
