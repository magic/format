export * from './lib.js'
export function format(args?: {
  include?: string | string[] | undefined
  exclude?: string | string[] | undefined
  fileTypes?: string[] | undefined
  write?: boolean | undefined
  config?: string | undefined
  silent?: boolean | undefined
  verbose?: boolean | undefined
}): Promise<string[]>
