/// <reference path="./types.d.ts" />

import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

import fs from '@magic/fs'

import { detectOptionalLanguages } from './languages.js'

const require = createRequire(import.meta.url)

/**
 * The oxfmt config shared with all consumers,
 * so they do not have to declare rules themselves
 * @type {string}
 */
export const sharedConfigPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'oxfmt.json',
)

/** @type {Record<string, any>} */
export const sharedConfig = require('./oxfmt.json')

/**
 * oxfmt config files oxfmt discovers itself,
 * checked in the consumer project
 * @type {string[]}
 */
export const discoverableConfigs = ['.oxfmtrc.json', '.oxfmtrc.jsonc']

/**
 * Skips whitespace, line comments and block comments
 * starting at index i
 * @param {string} text
 * @param {number} i
 * @returns {number}
 */
const skipComments = (text, i) => {
  while (i < text.length) {
    const ch = text[i]
    const next = text[i + 1]

    if (/\s/.test(ch)) {
      i++
    } else if (ch === '/' && next === '/') {
      while (i < text.length && text[i] !== '\n') i++
    } else if (ch === '/' && next === '*') {
      i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++
      i += 2
    } else {
      break
    }
  }

  return i
}

/**
 * Parses json or jsonc (comments and trailing commas allowed)
 * @param {string} text
 * @returns {Record<string, any>}
 */
export const parseJsonc = text => {
  /** @type {string[]} */
  const out = []

  let inString = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (inString) {
      out.push(ch)
      if (ch === '\\') {
        out.push(next ?? '')
        i++
      } else if (ch === '"') {
        inString = false
      }
      continue
    }

    if (ch === '"') {
      inString = true
      out.push(ch)
    } else if (ch === '/' && next === '/') {
      i = skipComments(text, i) - 1
    } else if (ch === '/' && next === '*') {
      i = skipComments(text, i) - 1
    } else if (ch === ',') {
      // trailing commas before } or ] are not valid json
      const after = skipComments(text, i + 1)
      if (text[after] !== '}' && text[after] !== ']') {
        out.push(ch)
      }
    } else {
      out.push(ch)
    }
  }

  return JSON.parse(out.join(''))
}

/**
 * Reads a user config file as a plain object.
 * Returns null when the file cannot be parsed here
 * (e.g. typescript configs), so the caller can
 * fall back to letting oxfmt handle it natively.
 * @param {string} file
 * @returns {Promise<Record<string, any>|null>}
 */
const readUserConfig = async file => {
  try {
    if (file.endsWith('.json') || file.endsWith('.jsonc')) {
      return parseJsonc(await fs.readFile(file, 'utf8'))
    }

    if (/\.(js|mjs|cjs)$/.test(file)) {
      const module = await import(file)
      const config = module.config ?? module.default
      if (config && typeof config === 'object') {
        return config
      }
    }

    return null
  } catch (e) {
    return null
  }
}

/**
 * The shared config with detected optional languages (svelte, astro)
 * enabled based on installed peer packages
 * @param {string} [nodeModulesDir]
 * @returns {Promise<Record<string, any>>}
 */
const withOptionalLanguages = async nodeModulesDir => {
  const { config: languageConfig } = await detectOptionalLanguages(nodeModulesDir)
  const base = { ...sharedConfig }
  for (const [key, enabled] of Object.entries(languageConfig)) {
    if (base[key] === undefined) {
      base[key] = enabled
    }
  }
  return base
}

/** @type {number} */
let tempCounter = 0

/**
 * Writes a config object to a temp file
 * @param {Record<string, any>} config
 * @returns {Promise<string>}
 */
const writeTempConfig = async config => {
  const file = path.join(
    os.tmpdir(),
    `magic-format-oxfmt-${process.pid}-${Date.now()}-${tempCounter++}.json`,
  )
  await fs.writeFile(file, JSON.stringify(config, null, 2))
  return file
}

/**
 * Loads Oxfmt configuration as an object for the in-process javascript api.
 * Resolution: the shared config (with optional languages enabled),
 * merged with the user config file when given.
 * @param {LoadConfigParams} [params={}]
 * @returns {Promise<OxfmtConfig>}
 */
export const loadConfig = async (params = {}) => {
  const { args = {}, cwd = process.cwd(), nodeModulesDir } = params

  try {
    const base = await withOptionalLanguages(nodeModulesDir)

    let configPath = args.config
    let exists = false

    if (configPath) {
      if (!path.isAbsolute(configPath)) {
        configPath = path.join(cwd, configPath)
      }

      exists = await fs.exists(configPath)
    }

    if (exists) {
      const userConfig = await readUserConfig(configPath)
      if (userConfig) {
        return { ...base, ...userConfig }
      }
    }

    return base
  } catch (e) {
    return { ...sharedConfig }
  }
}

/**
 * Resolves the config file the oxfmt cli should be invoked with.
 * Resolution: the shared config (with optional languages enabled)
 * merged with the user config (explicit --config or the consumer's own
 * .oxfmtrc*), written to a temp file. User configs that cannot be
 * parsed here (e.g. typescript) are passed to oxfmt as-is.
 * @param {LoadConfigParams} [params={}]
 * @returns {Promise<{file: string, temp: boolean}>}
 */
export const resolveConfigFile = async (params = {}) => {
  const { args = {}, cwd = process.cwd(), nodeModulesDir } = params

  /** @type {string|undefined} */
  let userConfigPath

  if (args.config) {
    userConfigPath = path.isAbsolute(args.config) ? args.config : path.join(cwd, args.config)
  } else {
    for (const name of discoverableConfigs) {
      const candidate = path.join(cwd, name)
      if (await fs.exists(candidate)) {
        userConfigPath = candidate
        break
      }
    }
  }

  const base = await withOptionalLanguages(nodeModulesDir)

  if (userConfigPath) {
    const userConfig = await readUserConfig(userConfigPath)

    if (userConfig) {
      const file = await writeTempConfig({ ...base, ...userConfig })
      return { file, temp: true }
    }

    // unparseable config (e.g. .ts): let oxfmt handle it natively
    return { file: userConfigPath, temp: false }
  }

  if (JSON.stringify(base) === JSON.stringify(sharedConfig)) {
    return { file: sharedConfigPath, temp: false }
  }

  const file = await writeTempConfig(base)
  return { file, temp: true }
}
