# @magic/format

run prettier and format your code.

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

- [install](#install)
- [usage](#usage)
  - [npm scripts](#npm-scripts)
  - [cli](#usage-cli)

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

`npm run format:check` will list the files that would be changed.

##### <a name="usage-cli"></a>cli

you can install this library globally,
but the recommendation is to add the dependency and scripts to the package.json file.

this both explains to everyone that your app has this dependencies
as well as keeping your bash free of clutter

```bash
npm i -g @magic/format

// check formatting using prettier but do not write
f

// format and overwrite files using prettier
f -w
```

##### <a name="usage-plugins"></a>prettier plugins

@magic/format supports a number of prettier plugins out of the box as optional peerDependencies.
Just install any of the following and prettier will start checking the appropriate files:

- ##### ext: plugin
- haml: @prettier/plugin-haml
- lua: @prettier/plugin-lua
- php: @prettier/plugin-php
- pug: @prettier/plugin-pug
- py: @prettier/plugin-python
- rb: @prettier/plugin-ruby
- gemspec: @prettier/plugin-ruby
- xml: @prettier/plugin-xml
- toml: @voltiso/prettier-plugin-toml
- astro: prettier-plugin-astro
- java: prettier-plugin-java
- svelte: prettier-plugin-svelte

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

##### 0.0.54 - unreleased

...
