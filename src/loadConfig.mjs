import path from 'path'

import fs from '@magic/fs'

import { config as defaultConfig } from './defaultConfig.mjs'

export const loadConfig = async cwd => {
  try {
    let configPath = ''
    let exists = false

    if (args.config) {
      const configPath = args.config[0]

      if (!path.isAbsolute(configPath)) {
        configPath = path.join(cwd, configPath)
      }

      exists = await fs.exists(configPath)
    }

    if (!exists) {
      return defaultConfig
    }

    const { config } = await import(configPath)
    return config
  } catch (e) {
    return defaultConfig
  }
}
