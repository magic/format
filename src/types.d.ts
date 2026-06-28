// Global type declarations for JSDoc type references

declare global {
  interface PrettierConfig {
    [key: string]: any
    semi?: boolean
    printWidth?: number
    tabWidth?: number
    useTabs?: boolean
    singleQuote?: boolean
    trailingComma?: 'all' | 'none' | 'es5'
    bracketSpacing?: boolean
    arrowParens?: 'avoid' | 'always'
    plugins?: any[]
    htmlWhitespaceSensitivity?: 'css' | 'strict' | 'ignore'
    singleAttributePerLine?: boolean
    filepath?: string
    parser?: string
  }

  interface FormatParams {
    include?: string | string[]
    exclude?: string | string[]
    fileTypes?: string[]
    write?: boolean
    config?: string
    plugins?: string[]
    verbose?: boolean
    silent?: boolean
  }

  interface FindFilesParams {
    include?: string | string[]
    exclude?: string | string[]
    fileTypes?: string[]
    verbose?: boolean
  }

  interface LoadConfigParams {
    args?: Record<string, any>
    config?: string
    plugins?: string[]
    cwd?: string
  }
}

export {}
