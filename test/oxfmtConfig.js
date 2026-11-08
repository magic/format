import { version } from '@magic/test'
import { default as sharedConfig } from '../src/oxfmt.config.js'

export const spec = {
  semi: 'bool',
  printWidth: 'int',
  tabWidth: 'int',
  useTabs: 'bool',
  singleQuote: 'bool',
  trailingComma: 'string',
  bracketSpacing: 'bool',
  arrowParens: 'string',
  htmlWhitespaceSensitivity: 'string',
  singleAttributePerLine: 'bool',
  sortPackageJson: 'bool',
}

export default version(sharedConfig, spec)
