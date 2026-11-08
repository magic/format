import { parseJsonc, skipComments } from '../src/lib/parseJsonc.js'

/** @type {any[]} */
export default [
  {
    fn: () => {
      const result = skipComments('  // comment\ncode', 0)
      return result === 13
    },
    expect: true,
    info: 'skipComments skips a leading line comment with whitespace',
  },
  {
    fn: () => {
      const result = skipComments('code\n// comment\nend', 0)
      return result === 0
    },
    expect: true,
    info: 'skipComments does not skip preceding regular code',
  },
  {
    fn: () => {
      const result = skipComments('/* block */ code', 0)
      return result === 12
    },
    expect: true,
    info: 'skipComments skips a leading block comment and trailing space',
  },
  {
    fn: () => {
      const result = skipComments('\t\n c', 0)
      return result === 3
    },
    expect: true,
    info: 'skipComments skips only whitespace before code',
  },
  {
    fn: () => {
      const result = skipComments('{"a": 1}', 0)
      return result === 0
    },
    expect: true,
    info: 'skipComments leaves JSON untouched when starting with JSON',
  },
  {
    fn: () => {
      const result = parseJsonc('{"a": 1}')
      return result.a === 1 && typeof result === 'object'
    },
    expect: true,
    info: 'parseJsonc parses a simple JSON object',
  },
  {
    fn: () => {
      const result = parseJsonc('{"a": 1, "b": 2, "c": 3}')
      return result.a === 1 && result.b === 2 && result.c === 3
    },
    expect: true,
    info: 'parseJsonc keeps regular (non-trailing) commas',
  },
  {
    fn: () => {
      const result = parseJsonc('// comment\n{"b": 2}')
      return result.b === 2 && typeof result === 'object'
    },
    expect: true,
    info: 'parseJsonc parses JSON with a leading line comment',
  },
  {
    fn: () => {
      const result = parseJsonc('{"c": 3,}')
      return result.c === 3 && typeof result === 'object'
    },
    expect: true,
    info: 'parseJsonc drops a trailing comma before }',
  },
  {
    fn: () => {
      const result = parseJsonc('["d",]')
      return Array.isArray(result) && result[0] === 'd'
    },
    expect: true,
    info: 'parseJsonc drops a trailing comma before ]',
  },
  {
    fn: () => {
      const result = parseJsonc('{/* comment */"e": 5}')
      return result.e === 5 && typeof result === 'object'
    },
    expect: true,
    info: 'parseJsonc parses JSON with a block comment',
  },
  {
    fn: () => {
      const result = parseJsonc('{"f": "g\\"h", /* mid */ "i": [1, 2,],}')
      return result.f === 'g"h' && result.i[1] === 2
    },
    expect: true,
    info: 'parseJsonc handles escaped quotes, block comments and trailing commas together',
  },
  {
    fn: () => {
      let threw = false
      try {
        parseJsonc('{"a": "x\\')
      } catch {
        threw = true
      }
      return threw
    },
    expect: true,
    info: 'parseJsonc throws a JSON error (not a crash) on a dangling backslash in a string',
  },
]
