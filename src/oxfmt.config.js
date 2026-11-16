/** @type {import("oxfmt").OxfmtConfig} */
const config = {
  semi: false,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'avoid',
  htmlWhitespaceSensitivity: 'css',
  singleAttributePerLine: false,
  sortPackageJson: true,
  svelte: true,
  sortImports: {
    customGroups: [
      {
        groupName: 'svelte',
        elementNamePattern: ['svelte', 'svelte-*', '@sveltejs/**'],
      },
      {
        groupName: 'systemkollektiv',
        elementNamePattern: ['@systemkollektiv/**'],
      },
      {
        groupName: 'magic',
        elementNamePattern: ['@magic/**'],
      },
      {
        groupName: 'magic-modules',
        elementNamePattern: ['@magic-modules/**'],
      },
      {
        groupName: 'magic-libraries',
        elementNamePattern: ['@magic-libraries/**'],
      },
      {
        groupName: 'magic-themes',
        elementNamePattern: ['@magic-libraries/**'],
      },
    ],
    newlinesBetween: false,
    groups: [
      'type-import',
      'type-internal',
      ['type-parent', 'type-sibling', 'type-index'],
      { newlinesBetween: true },
      'value-builtin',
      { newlinesBetween: true },
      'svelte',
      'magic',
      'magic-modules',
      'magic-libraries',
      'magic-themes',
      'systemkollektiv',
      { newlinesBetween: true },
      ['value-external'],
      'value-internal',
      ['value-parent', 'value-sibling', 'value-index'],
      'unknown',
    ],
  },
}

export default config
