// Global type declarations for JSDoc type references

declare global {
  interface FormatParams {
    include?: string | string[]
    exclude?: string | string[]
    fileTypes?: string[]
    write?: boolean
    config?: string
    silent?: boolean
    verbose?: boolean
  }
}

export {}
