export const View = state => [
  h1(state.title),

  state.description.map(d => p(d)),

  GitBadges('@magic/format'),

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

// check formatting using oxfmt but do not write
// oxfmt --list-different
f

// format files using oxfmt
// oxfmt --write
f -w
  `),

  h2({ id: 'config' }, 'configuration'),

  p(
    'the shared oxfmt config shipped by @magic/format is applied by default, so you do not have to declare formatting rules yourself.',
  ),

  p(
    'a project own oxfmt config (.oxfmtrc.json or .oxfmtrc.jsonc) merges over the shared defaults when present, or pass one explicitly:',
  ),

  Pre('f --config my-config.json'),

  h2({ id: 'languages' }, 'languages'),

  p('@magic/format uses oxfmt, which natively supports a wide range of languages out of the box:'),

  ul([
    li('javascript: js, mjs, cjs'),
    li('typescript: ts, tsx'),
    li('jsx: jsx'),
    li('json: json, jsonc, json5, gltf'),
    li('css: css, scss, less'),
    li('markdown: md, markdown, mdx'),
    li('html: html'),
    li('vue: vue'),
    li('graphql: graphql'),
    li('yaml: yaml'),
    li('toml: toml'),
  ]),

  p('svelte and astro are supported when their peer package is installed:'),

  ul([
    li('svelte: install the svelte package'),
    li('astro: install the @astrojs/compiler-rs package'),
  ]),
]
