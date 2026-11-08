/// <reference path="../types.d.ts" />

/**
 * Skips whitespace, line comments and block comments
 * starting at index i
 * @param {string} text
 * @param {number} i
 * @returns {number}
 */
export const skipComments = (text, i) => {
  while (i < text.length) {
    const ch = text[i]
    const next = text[i + 1]

    if (/\s/.test(ch)) {
      i++
    } else if (ch === '/' && next === '/') {
      while (i < text.length && text[i] !== '\n') {
        i++
      }
    } else if (ch === '/' && next === '*') {
      i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
        i++
      }
      i += 2
    } else {
      break
    }
  }

  return i
}

/**
 * Parses json or jsonc (comments and trailing commas allowed)
 * @param {string} text
 * @returns {Record<string, any>}
 */
export const parseJsonc = text => {
  /** @type {string[]} */
  const out = []

  let inString = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (inString) {
      out.push(ch)
      if (ch === '\\') {
        out.push(next ?? '')
        i++
      } else if (ch === '"') {
        inString = false
      }
      continue
    }

    if (ch === '"') {
      inString = true
      out.push(ch)
    } else if (ch === '/' && next === '/') {
      i = skipComments(text, i) - 1
    } else if (ch === '/' && next === '*') {
      i = skipComments(text, i) - 1
    } else if (ch === ',') {
      // trailing commas before } or ] are not valid json
      const after = skipComments(text, i + 1)
      if (text[after] !== '}' && text[after] !== ']') {
        out.push(ch)
      }
    } else {
      out.push(ch)
    }
  }

  return JSON.parse(out.join(''))
}
