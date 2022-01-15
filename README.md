# packageDiffRemote

[![npm version](https://img.shields.io/npm/v/packagediffremote.svg?style=flat-square)](https://www.npmjs.org/package/packagediffremote)
[![npm downloads](https://img.shields.io/npm/dm/packagediffremote.svg?style=flat-square)](http://npm-stat.com/charts.html?package=packagediffremote)

The purpose of this package is to show the differences between the code in NPM modules/packages which is often downloaded from NPM and the code for NPM modules/packages (which is often hosted on GitHub). This module was inspired by this article: https://therecord.media/malware-found-in-coa-and-rc-two-npm-packages-with-23m-weekly-downloads/ where malware was found in two popular NPM modules/packages.

### CLI

The executables provided in the `executables` folder allow this module/package to be used as a cli application. You will need to download the appropriate executable and configure the command yourself though (so you do not have to use the full executable path).

All of the executables were built using Node v12.16.3 and used the `pkg` module/package

### API

This package also exposes an API which can be used in other projects.

To use the API please run the following command:

```shell
npm i packagediffremote
```

An example usage of the API can be seen below:
```javascript
const packageDiffRemote = require('packageDiffRemote');

packageDiffRemote().then(function (data) {
  console.log(data);
}).catch(function (err) {
  console.error(err);
})

```
The output of data (from the code sample above) will be structured as follows:
```json
[
  {
    "file": "absolute/path/to/file",
    "diff": [
      {
        "count": 5,
        "value": "some string"
      },
      {
        "count": 1,
        "added": undefined,
        "removed": true,
        "value": "string"
      },
      {
        "count": 10,
        "added": true,
        "removed": undefined,
        "value": "different string"
      }
    ]
  }
]
```

##### To Do

Currently the only supported hosting platform is GitHub which is not ideal... Ideally this package would support more hosting platforms...
