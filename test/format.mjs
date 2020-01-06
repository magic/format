import is from '@magic/types'

import { config } from '../src/defaultConfig.mjs'

// do not change this object!
const expected = {
  semi: false,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'avoid',
}

export default [
  { fn: () => is.len.equal(config, expected) },
  { fn: () => Object.keys(config).every(k => config[k] === expected[k]) },
]
