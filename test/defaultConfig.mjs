import { version } from '@magic/test'
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
  plugins: 'array',
  htmlWhitespaceSensitivity: 'string',
}

export default version(config, spec)
