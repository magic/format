import { is } from '@magic/test'

import lib from '../src/index.mjs'

export default [{ fn: () => lib, expect: is.fn, info: 'lib is a function' }]
