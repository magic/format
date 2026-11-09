/// <reference path="../types.ts" />

import path from 'node:path'

import fs from '@magic/fs'

import { configFiles, sharedConfigPath } from '../constants.js'
import { default as sharedConfig } from '../oxfmt.config.js'

import { writeTempConfig } from './writeTempConfig.js'
import { readUserConfig } from './readUserConfig.js'

/**
 * Resolves the config file to pass to the oxfmt cli.
 * oxfmt does not merge configs, so an explicit --config, or a consumer
 * config discovered in the project, is merged over the shared config
 * and written to a temp file. User configs that cannot be parsed here
 * (e.g. typescript) are passed to oxfmt as-is, otherwise the shared
 * config is used.
 * @param {Record<string, any>} [args]
 * @param {string} [cwd=process.cwd()]
 * @returns {Promise<{file: string, temp: boolean}>}
 */
export const resolveConfig = async (args = {}, cwd = process.cwd()) => {
  /** @type {string|undefined} */
  let userConfigPath

  if (args.config) {
    userConfigPath = path.isAbsolute(args.config) ? args.config : path.join(cwd, args.config)
  } else {
    for (const name of configFiles) {
      const candidate = path.join(cwd, name)
      if (await fs.exists(candidate)) {
        userConfigPath = candidate
        break
      }
    }
  }

  if (!userConfigPath) {
    return { file: sharedConfigPath, temp: false }
  }

  const userConfig = await readUserConfig(userConfigPath)

  if (userConfig) {
    return { file: await writeTempConfig({ ...sharedConfig, ...userConfig }), temp: true }
  }

  // unparseable config (e.g. .ts): let oxfmt handle it natively
  return { file: userConfigPath, temp: false }
}
