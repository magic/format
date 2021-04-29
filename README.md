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

* [install](#install)
* [usage](#usage)
  * [npm scripts](#npm-scripts)
  * [cli](#usage-cli)


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

#### Changelog

##### 0.0.1
first commit

##### 0.0.2
* change error output
* node version is strict

##### 0.0.3
update deps

##### 0.0.4
update info messages

##### 0.0.5
update dependencies

##### 0.0.6
messages now being logged from bin.mjs, making src/index.mjs return a list of changedFiles instead.

##### 0.0.7
* cli script awaits format before displaying information
* add --silent option to suppress info if nothing got changed

##### 0.0.8
update dependencies

##### 0.0.9
update prettier

##### 0.0.10
update dependencies

##### 0.0.11
bump required node version to 14.2.0

##### 0.0.12 
* do not error if .gitignore does not exist

##### 0.0.13
* npm i -g @magic/format now is actually usable.

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
* bump required node version to 14.15.4
* update dependencies

##### 0.0.22
update dependencies (@magic/fs)

##### 0.0.23
update dependencies

##### 0.0.24 - unreleased
...
