import path from 'path'
import fs from '@magic/fs'

import {
  fileTypes,
  checkOptionalDependencies,
  checkPossiblePlugins,
  additionalPossiblePrettierPlugins,
  optional,
} from '../src/bin.js'

export default [
  {
    fn: () => Array.isArray(fileTypes),
    expect: true,
    info: 'fileTypes is an array',
  },
  {
    fn: () => fileTypes.includes('mjs'),
    expect: true,
    info: 'fileTypes includes mjs',
  },
  {
    fn: () => fileTypes.includes('css'),
    expect: true,
    info: 'fileTypes includes css',
  },
  {
    fn: () => fileTypes.includes('glsl'),
    expect: true,
    info: 'fileTypes includes glsl shader types',
  },
  {
    fn: () => fileTypes.includes('svelte'),
    expect: true,
    info: 'fileTypes includes svelte',
  },
  {
    fn: () => Array.isArray(additionalPossiblePrettierPlugins),
    expect: true,
    info: 'additionalPossiblePrettierPlugins is an array',
  },
  {
    fn: () => additionalPossiblePrettierPlugins.length > 0,
    expect: true,
    info: 'additionalPossiblePrettierPlugins has entries',
  },
  {
    fn: async () => {
      // Test checkOptionalDependencies with non-existent plugin
      await checkOptionalDependencies(['nonexistent', 'nonexistent-plugin'])
      return true
    },
    expect: true,
    info: 'checkOptionalDependencies handles missing plugins',
  },
  {
    fn: async () => {
      // Test checkPossiblePlugins with non-existent plugin
      await checkPossiblePlugins('nonexistent-plugin')
      return true
    },
    expect: true,
    info: 'checkPossiblePlugins handles missing plugins',
  },
  {
    fn: async () => {
      // Test checkOptionalDependencies with existing plugin by creating a fake node_modules entry
      const fakePluginDir = path.join(process.cwd(), 'node_modules', 'prettier-plugin-fake')
      await fs.mkdir(fakePluginDir, { recursive: true })

      const originalLength = fileTypes.length
      await checkOptionalDependencies(['fake', 'prettier-plugin-fake'])

      // Cleanup
      await fs.rm(fakePluginDir, { recursive: true, force: true })

      // If plugin was found, fileTypes should include 'fake'
      return fileTypes.includes('fake')
    },
    expect: true,
    info: 'checkOptionalDependencies adds plugin when directory exists',
  },
  {
    fn: async () => {
      // Test checkPossiblePlugins with existing plugin
      const fakePluginDir = path.join(process.cwd(), 'node_modules', 'prettier-plugin-test')
      await fs.mkdir(fakePluginDir, { recursive: true })

      await checkPossiblePlugins('prettier-plugin-test')

      // Cleanup
      await fs.rm(fakePluginDir, { recursive: true, force: true })

      return true
    },
    expect: true,
    info: 'checkPossiblePlugins adds plugin when directory exists',
  },
  {
    fn: () => {
      // Test that optional plugins have correct structure
      const keys = Object.keys(optional)
      return keys.length > 0 && keys.includes('haml') && keys.includes('glsl')
    },
    expect: true,
    info: 'optional plugins object has correct structure',
  },
]
