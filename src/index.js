/// <reference path="./types.d.ts" />

import path from 'path'

import prettier from 'prettier'

import deep from '@magic/deep'
import fs from '@magic/fs'
import is from '@magic/types'
import log from '@magic/log'

import { findFiles } from './findFiles.js'
import { loadConfig } from './loadConfig.js'

/** @type {string} */
const cwd = process.cwd()

/**
 * Formats code files using Prettier
 * @param {FormatParams} args
 * @returns {Promise<string[]>} - Array of changed file paths
 */
export const format = async args => {
  /** @type {string[]} */
  let include = []
  if (args.include) {
    if (is.string(args.include)) {
      include = [args.include]
    } else {
      include = args.include
    }
  } else {
    include = [cwd]
  }

  /** @type {string[]} */
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

  /** @type {string[]} */
  let fileTypes = ['js', 'json']
  if (args.fileTypes) {
    fileTypes = args.fileTypes
  }

  const files = await findFiles({ include, exclude, fileTypes, verbose: args.verbose })

  const config = await loadConfig({ args, cwd })

  let changedFiles = await Promise.all(
    files.map(async file => {
      try {
        const content = await fs.readFile(file, 'utf8')
        const changed = await prettier.format(content, { ...config, filepath: file })
        if (content !== changed) {
          if (args.write) {
            const tmpFile = file + '.tmp'
            await fs.writeFile(tmpFile, changed)
            await fs.rename(tmpFile, file)
          }

          return file
        }
      } catch (e) {
        const relativeFile = file.replace(cwd, '')
        log.error(e.code, `error in file: ${relativeFile}`, e.message)
      }
    }),
  )

  return changedFiles.filter(a => a)
}

/**
 * Formats a string using Prettier
 * @param {string} content - The content to format
 * @param {FormatParams} [args] - Formatting options
 * @returns {Promise<string>} - Formatted content
 */
export const formatString = async (content, args) => {
  const config = await loadConfig({ args })

  if (!config.parser) {
    config.parser = 'babel'
  }

  return await prettier.format(content, config)
}

export default format
