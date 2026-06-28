import path from 'path'

import fs from '@magic/fs'

import { config as defaultConfig } from './defaultConfig.js'

export const loadConfig = async (params = {}) => {
  const { args = {}, cwd = process.cwd() } = params

  try {
    let configPath = ''
    let exists = false

    if (args.config) {
      configPath = args.config

      if (!path.isAbsolute(configPath)) {
        configPath = path.join(cwd, configPath)
      }

      exists = await fs.exists(configPath)
    }

    if (!exists) {
      const config = { ...defaultConfig, plugins: [...defaultConfig.plugins] }
      if (args.plugins) {
        args.plugins.forEach(plugin => {
          config.plugins.push(plugin)
        })
      }
      return config
    }

    const { config } = await import(configPath)

    if (args.plugins) {
      args.plugins.forEach(plugin => {
        config.plugins.push(plugin)
      })
    }

    return config
  } catch (e) {
    return { ...defaultConfig, plugins: [...defaultConfig.plugins] }
  }
}
