import { is, version } from '@magic/test'
import { config } from '../src/defaultConfig.mjs'

export const spec = {
  semi: is.bool,
  printWidth: is.int,
  tabWidth: is.int,
  useTabs: is.bool,
  singleQuote: is.bool,
  trailingComma: is.string,
  bracketSpacing: is.bool,
  arrowParens: is.string,
}

export default version(config, spec)
