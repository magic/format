import { version } from '@magic/test'
import { config } from '../src/defaultConfig.js'

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
  singleAttributePerLine: 'bool',
}

export default version(config, spec)
