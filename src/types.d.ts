// Global type declarations for JSDoc type references

declare global {
  interface OxfmtConfig {
    [key: string]: any
    semi?: boolean
    printWidth?: number
    tabWidth?: number
    useTabs?: boolean
    singleQuote?: boolean
    trailingComma?: 'all' | 'none' | 'es5'
    bracketSpacing?: boolean
    arrowParens?: 'avoid' | 'always'
    htmlWhitespaceSensitivity?: 'css' | 'strict' | 'ignore'
    singleAttributePerLine?: boolean
    svelte?: boolean | Record<string, any>
    astro?: boolean | Record<string, any>
    /** @deprecated legacy prettier parser name, mapped to a file extension in formatString */
    parser?: string
  }

  interface FormatParams {
    include?: string | string[]
    exclude?: string | string[]
    fileTypes?: string[]
    write?: boolean
    config?: string
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
    cwd?: string
    nodeModulesDir?: string
  }
}

export {}
