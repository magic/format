export const View = state => [
  h1(state.title),

  state.description.map(d => p(d)),

  GitBadges('magic/format'),

  h2({ id: 'install' }, 'install'),
  p('be in a nodejs project.'),

  Pre('npm i --save-dev --save-exact @magic/format'),

  h2({ id: 'usage' }, 'Usage'),

  h2({ id: 'usage-npm' }, 'npm run scripts'),
  p('Add the @magic/test bin scripts to package.json'),

  Pre(`
{
  "scripts": {
    "format": "f -w",
    "format:check": "f"
  },
  "devDependencies": {
    "@magic/format": "0.0.1"
  }
}`),

  p('then use the npm run scripts'),
  Pre(`
npm run format
npm run format:check
  `),

  h3({ id: 'usage-cli' }, 'cli'),

  Pre(`
// first install globally
npm i -g @magic/format

// check formatting using prettier but do not write
// prettier --list-different
f

// format files using prettier
// prettier --write
f -w
  `),
]
