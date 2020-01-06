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

##### 0.0.2 - unreleased
...
