# @magic/format

run oxfmt and format your code.

#### <a name="warning"></a>warning: prettier got replaced with oxfmt

since 0.0.76, @magic/format runs [oxfmt](https://oxc.rs/docs/guide/usage/formatter)
instead of prettier. what changed for you:

- the formatting output can differ from prettier in edge cases
  (line wrapping, comment placement), so expect one reformat pass on the first run.
- f formats all oxfmt supported file types by default,
  including html, vue, graphql, yaml, toml, mdx, less, json5 and jsonc.
- prettier plugin languages are no longer formatted:
  haml, lua, php, pug, py, rb, gemspec, xml, java and glsl, as well as sass.
- f now exits with 1 when unformatted files are found (previously always 0),
  so format:check can gate your ci.
- a custom config now merges over the shared defaults instead of replacing them
  (both the cli and the javascript api).

if your project relies on prettier specific output or prettier plugins,
pin to 0.0.75 until you have reviewed the formatting diff.

[html docs](https://magic.github.io/format)

[![NPM version][npm-image]][npm-url]
[![Linux Build Status][travis-image]][travis-url]
[![Windows Build Status][appveyor-image]][appveyor-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Greenkeeper badge][greenkeeper-image]][greenkeeper-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]

[npm-image]: https://img.shields.io/npm/v/@magic/format.svg
[npm-url]: https://www.npmjs.com/package/@magic/format
[travis-image]: https://img.shields.io/travis/com/magic/format/master
[travis-url]: https://travis-ci.com/magic/format
[appveyor-image]: https://img.shields.io/appveyor/ci/magic/format/master.svg
[appveyor-url]: https://ci.appveyor.com/project/magic/format/branch/master
[coveralls-image]: https://coveralls.io/repos/github/magic/format/badge.svg
[coveralls-url]: https://coveralls.io/github/magic/format
[greenkeeper-image]: https://badges.greenkeeper.io/magic/format.svg
[greenkeeper-url]: https://badges.greenkeeper.io/magic/format.svg
[snyk-image]: https://snyk.io/test/github/magic/format/badge.svg
[snyk-url]: https://snyk.io/test/github/magic/format

- [warning: prettier got replaced with oxfmt](#warning)
- [install](#install)
- [usage](#usage)
  - [npm scripts](#npm-scripts)
  - [cli](#usage-cli)
  - [configuration](#usage-config)
  - [languages](#usage-languages)
  - [javascript api](#usage-js)
  - [exit codes](#usage-exit-codes)

#### <a name="install"></a>getting started

be in a nodejs project.

```bash
npm i --save-dev @magic/format
```

#### <a name="npm-scripts"></a>npm run scripts

edit package.json:

```json
{
  "scripts": {
    "format": "f -w",
    "format:check": "f"
  }
}
```

`npm run format` will format and overwrite your source files,

`npm run format:check` will list the files that would be changed
and exits with 1 if any of them are found,
which lets you gate your ci on formatting.

##### <a name="usage-cli"></a>cli

you can install this library globally,
but the recommendation is to add the dependency and scripts to the package.json file.

this both explains to everyone that your app has this dependencies
as well as keeping your bash free of clutter

```bash
npm i -g @magic/format

// check formatting using oxfmt but do not write
f

// format and overwrite files using oxfmt
f -w

// format specific paths
f src test
```

options:

```
f [paths]          - list the files that need formatting (default)
f -w [paths]       - format files in place
f -e <path>        - exclude a path (repeatable, e.g. -e docs)
f -f <types>       - only format the given file types (e.g. -f js,json)
f -c <config>      - use the given oxfmt config file
f -s               - suppress the "no changes needed" message
f -v               - echo the oxfmt command and its output
```

##### <a name="usage-config"></a>configuration

@magic/format ships a shared oxfmt config (src/oxfmt.json) that all consumers
inherit by default, so you do not have to declare formatting rules yourself.

a project own oxfmt config (.oxfmtrc.json or .oxfmtrc.jsonc) takes precedence
over the shared config. it merges over the shared defaults,
so a minimal override keeps all the other shared rules:

```json
{
  "printWidth": 80
}
```

you can also point f at a config file explicitly:

```bash
f --config my-config.json
```

the javascript api merges a custom config (args.config) the same way:

```js
// printWidth 80, everything else from the shared config
await formatString('const a=1;', { config: 'my-config.json' })
```

configs in .ts, .mts or .cts cannot be merged here
and are handed to oxfmt as-is.

##### <a name="usage-languages"></a>languages

oxfmt natively supports: js, mjs, cjs, ts, tsx, jsx, json, jsonc, json5, gltf,
css, scss, less, md, markdown, mdx, html, vue, graphql, yaml and toml.
these are all formatted by default.

svelte and astro are formatted when their peer package is installed:

- svelte: install the svelte package
- astro: install the @astrojs/compiler-rs package

no longer formatted (left over from the prettier plugin era):
haml, lua, php, pug, py, rb, gemspec, xml, java, glsl and sass.

f honours .gitignore and .prettierignore out of the box.

##### <a name="usage-js"></a>javascript api

```js
import { format, formatString } from '@magic/format'

// format files (js and json by default), returns the changed file paths
const changed = await format({ fileTypes: ['js', 'json'] })

// format a string using the shared config
const out = await formatString('const a=1;')
```

formatString accepts a config file via args.config.
legacy prettier parser names in the config (parser: "babel", "babel-ts", "json", ...)
are mapped to file extensions, unknown parsers default to javascript.

##### <a name="usage-exit-codes"></a>exit codes

- 0: everything is formatted
- 1: unformatted files were found (check mode)
- 2: oxfmt reported parse errors

the affected files are printed to stdout, so f can be piped:

```bash
f | xargs -r cat
```

#### Changelog

##### 0.0.1

first commit

##### 0.0.2

- change error output
- node version is strict

##### 0.0.3

update deps

##### 0.0.4

update info messages

##### 0.0.5

update dependencies

##### 0.0.6

messages now being logged from bin.mjs, making src/index.mjs return a list of changedFiles instead.

##### 0.0.7

- cli script awaits format before displaying information
- add --silent option to suppress info if nothing got changed

##### 0.0.8

update dependencies

##### 0.0.9

update prettier

##### 0.0.10

update dependencies

##### 0.0.11

bump required node version to 14.2.0

##### 0.0.12

- do not error if .gitignore does not exist

##### 0.0.13

- npm i -g @magic/format now is actually usable.

##### 0.0.14

update dependencies

##### 0.0.15

update dependencies

##### 0.0.16

update dependencies

##### 0.0.17

update dependencies

##### 0.0.18

update dependencies

##### 0.0.19

update dependencies

##### 0.0.20

update dependencies

##### 0.0.21

- bump required node version to 14.15.4
- update dependencies

##### 0.0.22

update dependencies (@magic/fs)

##### 0.0.23

update dependencies

##### 0.0.24

update dependencies

##### 0.0.25

- update dependencies (@magic/fs)
- ** broken npm cache **

##### 0.0.26

release to refresh npm cache

##### 0.0.27

update @magic/types and intermediate deps to avoid circular dependency

##### 0.0.28

update depdendencies

##### 0.0.29

update dependencies

##### 0.0.30

update dependencies

##### 0.0.31

update dependencies

##### 0.0.32

- format .js files by default
- update dependencies

##### 0.0.33

- update dependencies

##### 0.0.34

- less runtime errors
- more tests
- update dependencies

##### 0.0.35

update dependencies

##### 0.0.36

update dependencies

##### 0.0.37

update dependencies

##### 0.0.38

update dependencies

##### 0.0.39

- update dependencies
- make sure errors happening whilst formatting files
  do not lead to data loss in other files
  that are being written at that same point in time

##### 0.0.40

update dependencies

##### 0.0.41

update dependencies

##### 0.0.42

update dependencies

##### 0.0.43

update dependencies

##### 0.0.44

- add svelte and astro support (prettier-plugin-svelte and prettier-plugin-astro)
- support more filetypes as default:
  `mjs, js, ts, json, jsx, tsx, svelte, astro, markdown, md`

##### 0.0.45

add `css, scss, sass` filetypes

##### 0.0.46

catch SIGINT and wait for files to write before executing process.exit()

##### 0.0.47

- add pug and gltf to default --file-types
- update dependencies

##### 0.0.48

actually distribute @prettier/plugin-pug

##### 0.0.49

- update dependencies
- move all prettier plugins to optionalDependencies, we can install them where needed

##### 0.0.50

- update dependencies
- add various prettier plugins as optional peerDependencies, and check for them in the cli. if they exist, add their extensions to the prettier fileTypes
- catch SIGTERM in addition to SIGINT. SIGKILL is uncatchable.

##### 0.0.51

update dependencies

##### 0.0.52

update dependencies

##### 0.0.53

- manually import preinstalled optional prettier plugins
- update dependencies

##### 0.0.54

- expose format and formatString as javascript api
- update dependencies

##### 0.0.55

- peerDependencies allow newer versions

##### 0.0.56

- peerDependencies allow any version

##### 0.0.57

- fix peerDependency resolution

##### 0.0.58

- readd plugins: [] to defaultConfig,
  allowing us to expand them with installed peerDependencies

##### 0.0.59

- update dependencies
- add glsl shader support (plugin-prettier-glsl)

##### 0.0.60

- update deps

##### 0.0.61

- add htmlWhitespaceSensitivity: ignore
- update deps

##### 0.0.62

- add prettier-plugin-tailwindcss
- update prettier dependency

##### 0.0.63

- use prettier-plugin-tailwindcss for svelte files

##### 0.0.64

- prettier-plugin-tailwindcss: add to svelte and astro apps

##### 0.0.65

- remove prettier-plugin-tailwindcss, it breaks a lot of svelte code

##### 0.0.66

- update dependencies

##### 0.0.67

- findFiles uses fs.getFiles
- findFiles also finds dotfile dirs and files
- add --verbose flag to echo files that get checked
- update dependencies

##### 0.0.68

- errors when parsing now emit the relative file path in addition to the error.

##### 0.0.69

- prettier-plugin-glsl is optional
- update docs
- update dependencies

##### 0.0.70

- remove peerDependencies
- detect more plugins
- some more tests
- update dependencies

##### 0.0.71

- change htmlWhitespaceSensitivity to strict

##### 0.0.72

- change htmlWhitespaceSensitivity to css
- add oneAttributePerLine to false

##### 0.0.73

- update dependencies

##### 0.0.74

- update dependencies

##### 0.0.75

- better config handling
- add typescript and types
- update dependencies

##### 0.0.76 - unreleased

- replace prettier with oxfmt
- the cli now runs the oxfmt binary as a child process,
  inheriting its file discovery, gitignore and prettierignore handling,
  glob support and threaded parallelism
- ship a shared oxfmt config (src/oxfmt.json) that all consumers inherit by default.
  a project own .oxfmtrc.json or .oxfmtrc.jsonc (or f --config) overrides it.
- f now formats all oxfmt supported file types by default
- f accepts positional paths (f src test)
- f exits 1 when unformatted files are found and 2 on parse errors,
  and prints the affected files to stdout
- svelte and astro are enabled automatically when their peer package is installed
- formatString maps legacy prettier parser names to file extensions
- remove prettier plugin support (haml, lua, php, pug, py, rb, xml, java, glsl) -
  those languages are not supported by oxfmt
