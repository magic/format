import { is, version } from '@magic/test'
import { config } from '../src/defaultConfig.mjs'

export const spec = {
  semi: 'bool',
  printWidth: 'int',
  tabWidth: 'int',
  useTabs: 'bool',
  singleQuote: 'bool',
  trailingComma: 'string',
  bracketSpacing: 'bool',
  arrowParens: 'string',
}

export default version(config, spec)
