# Doxity

### Documentation Generator for Solidity

Uses [gatsby](https://github.com/gatsbyjs/gatsby) to generate beautiful Solidity docs automatically via [natspec](https://github.com/ethereum/wiki/wiki/Ethereum-Natural-Specification-Format).

![Doxity Screenshot](http://i.imgur.com/9S6COQE.png)

## Installation

You can install `@digix/doxity` globally or locally in your project. You'll also need `solc`.

```bash
# globally
npm install -g @digix/doxity
# project folder
npm install --save-dev @digix/doxity
```

## Quickstart

1. Have a (truffle?) project that contains natspecced contracts.
2. `doxity init`
3. `doxity build`
4. `doxity publish`
5. Now you'll have a `./docs` folder in your project (start a local http server to open it)
6. Push to github
7. Go to your repo options, update 'Github Pages -> Set Source' to 'master branch /docs folder'
8. Your documentation is live! Why not set up a Travis CI script to automate that whenever you commit?

## Usage

The `doxity` cli tool is designed for npm/solidity projects. It's designed for use with [Truffle](https://github.com/ConsenSys/truffle).

Here's an outline of the available commands:

* `doxity init`
  * Creates a `./scripts/doxity` directory
  * Clones [this repo](https://github.com/DigixGlobal/doxity-gatsby-starter-project.git) into it
  * Runs `npm install` in the doxity directory
* `doxity build`
  * Generates Solidity devdocs, userdocs, abi, etc. using `solc`
  * Formats data and copies output into gatsby project
  * [TODO] Set up readme, config, copy other project details
* `doxity develop`
  * Runs `gatsby develop` start dev server on 8000 - you can then edit files the doxity (gatsby) project
* `doxity publish`
  * Runs `gatsby build` to generate the static HTML
  * Outputs to `./docs`

Unless you override them, default arguments will be used:

* `doxity init`
  * `--source` git url for bootstrappign - defaults to `https://github.com/DigixGlobal/doxity-gatsby-starter-project.git`
  * `--target` doxity source files directory - defaults to `./scripts/doxity`
* `doxity build`
  * `--target` doxity source files directory - defaults to `./scripts/doxity`
  * `--src` folder that contains the contracts you want to compile - defaults to `contracts`
  * `--dir` folder in gatsby project to dump generated docs data - defaults to `pages/docs`
* `doxity develop`
  * `--target` doxity source files directory - defaults to `./scripts/doxity`
* `doxity publish`
  * `--target` doxity source files directory - defaults to `./scripts/doxity`
  * `--out` folder to output the generated html (relative to project root) - defaults to `docs`

## Protip

If you are installing locally, you could add the following to your `package.json`:

```javascript
"scripts" : {
  "docs:init": "node_modules/.bin/doxity init", // add your custom arguments (see API below)
  "docs:build": "node_modules/.bin/doxity build",
  "docs:develop": "node_modules/.bin/doxity develop",
  "docs:publish": "node_modules/.bin/doxity publish",
  "docs:compile": "npm run docs:build; npm run docs:publish", // build + publish
  ...
},
```

You can then use `npm run docs:[command]` as a proxy for `doxity [command]`.

## TODO

* [build step] Set up config, copy readme, other project details
* Options to hide source files / binaries
* Sourcemaps
* Live web3 instance for testing?
* Tests

## License

BSD-3-Clause 2016
