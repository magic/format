/// <reference path="./types.d.ts" />

import path from 'path'

import { format as oxfmtFormat } from 'oxfmt'

import deep from '@magic/deep'
import fs from '@magic/fs'
import is from '@magic/types'
import log from '@magic/log'

import { findFiles } from './findFiles.js'
import { loadConfig } from './config.js'

/** @type {string} */
const cwd = process.cwd()

/**
 * Maps legacy prettier parser names to file extensions,
 * so oxfmt can detect the language from the file name
 * @type {Record<string, string>}
 */
const parserExtensions = {
  babel: '.js',
  espree: '.js',
  acorn: '.js',
  meriyah: '.js',
  estree: '.js',
  flow: '.js',
  'babel-ts': '.ts',
  typescript: '.ts',
  json: '.json',
  'json-stringify': '.json',
  json5: '.json5',
  jsonc: '.jsonc',
  css: '.css',
  less: '.less',
  scss: '.scss',
  markdown: '.md',
  mdx: '.mdx',
  yaml: '.yaml',
  html: '.html',
  vue: '.vue',
  svelte: '.svelte',
  astro: '.astro',
  graphql: '.graphql',
  lwc: '.html',
}

/**
 * Formats the content of a single file using oxfmt
 * @param {string} file
 * @param {string} content
 * @param {OxfmtConfig} config
 * @returns {Promise<string>}
 */
export const formatFileContent = async (file, content, config) => {
  const { code, errors } = await oxfmtFormat(file, content, config)

  if (errors.length) {
    throw new Error(errors[0].message)
  }

  return code
}

/**
 * Formats code files using Oxfmt
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
        const changed = await formatFileContent(file, content, config)
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
        log.error(e.code || 'FORMAT_ERROR', `error in file: ${relativeFile}`, e.message)
      }
    }),
  )

  return changedFiles.filter(a => a)
}

/**
 * Formats a string using Oxfmt
 * @param {string} content - The content to format
 * @param {FormatParams} [args] - Formatting options
 * @returns {Promise<string>} - Formatted content
 */
export const formatString = async (content, args) => {
  const config = await loadConfig({ args })

  const parser = config.parser || 'babel'
  const extension = parserExtensions[parser] || '.js'

  return await formatFileContent(`input${extension}`, content, config)
}

export default format
