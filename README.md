# Documenter
[![Travis](https://img.shields.io/travis/denali-js/documenter.svg?style=flat-square)](https://travis-ci.org/denali-js/)documenter
[![Dependencies](https://img.shields.io/david/denali-js/documenter.svg?style=flat-square)](https://david-dm.org/denali-js/)documenter
[![npm downloads](https://img.shields.io/npm/denali-js/documenter.svg?style=flat-square)](https://www.npmjs.com/package/)documenter
![latest version](https://img.shields.io/npm/v/documenter.svg?style=flat-square)

Generate documentation for your JavaScript or Typescript projects!

Includes support for API reference docs generated automatically from code comments, as well as Markdown guides.

Documenter does not generate HTMl or any other kind of rendered output - it only extracts the documentation from your codebase and supplies it in a structured, consistent format for you to render as you wish.

Used by the [Denali CLI](denalijs.org) to generate documentation for Denali projects, but it's not tied to Denali projects only.

## Usage

You can use the extracter directly:

```js
import { Extracter } from 'documenter';

let extracter = new Extracter({

  // The base directory to start everything from
  dir: process.cwd(),

  // The directory to scan for Markdown files
  pagesDir: 'guides',

  // An array of glob patterns to search for source files
  sourceDirs: [ 'src' ],

  // The name of the project
  projectName: 'typescript-project',

  // The current version of the project
  projectVersion: '1.0.0'

});

let docs = extracter.extract();
```

Or, if you happen to be using Broccoli, you can use the Broccoli plugin:

```js
import { ExtracterTree } from 'documenter';

// inputTree should contain the pages and source you want to extract
// All paths will be relative to the inputTree
let extracter = new ExtracterTree(inputTree, {

  // The directory to scan for Markdown files
  pagesDir: 'guides',

  // An array of glob patterns to search for source files
  sourceDirs: [ 'src' ],

  // The name of the project
  projectName: 'typescript-project',

  // The current version of the project
  projectVersion: '1.0.0'

});

// The Broccoli plugin will write out the resulting docs data to `docs.json`
// If a `docs.json` exists in the inputTree, it will simply copy that over
// and skip the extraction.
```

For an example of what the final docs structure looks like, check the [test output helper file](https://github.com/denali-js/documenter/blob/master/test/helpers/output-expectation.js).
