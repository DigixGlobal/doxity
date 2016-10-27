# Doxity

### Documentation Generator for Solidity

Uses [gatsby](https://github.com/gatsbyjs/gatsby) to generate beautiful Solidity docs automatically via [natspec](https://github.com/ethereum/wiki/wiki/Ethereum-Natural-Specification-Format).

![Doxity Screenshot](http://i.imgur.com/9S6COQE.png)

## Installation

You can install `@digix/doxity` globally or locally in your project.

You'll also need solc `0.4.X` installed on your machine.

```bash
# globally
npm install -g @digix/doxity
# project folder
npm install --save-dev @digix/doxity
```

## Quickstart

1. Have a project that contains natspecced `.sol` contracts in a `contracts` directory.
1. `doxity init` will clone and set up the boilerplate project
1. `doxity build` will compile the contracts and get json meta data
1. optional `doxity develop` will start a development server for editing project files found in `./scripts/doxity`
1. `doxity publish` will generate static HTML containing documentation
1. Yo'll have a `./docs` folder in your project which can be easily deployed
1. Push it to `master` on github
1. Go to your repo options, update 'Github Pages -> Set Source' to 'master branch /docs folder'
1. Your documentation is live! Why not set up a Travis CI script to automate that whenever you commit?

## Usage

### `.doxityrc`

You can configure all of doxity's options using a `.doxityrc` file at the root of your project, with the following structure:

```javascript
// .doxityrc
{
  // gatsby project source files directory
	"target": "scripts/doxity",
  // folder that contains the contracts you want to compile
	"src": "contracts",
  // folder in gatsby project to dump contract data
	"dir": "pages/docs",
  // folder to output the generated html (relative to project root)
	"out": "docs",
  // git url for bootstrapping the gatsby project
  "source": "https://github.com/DigixGlobal/doxity-gatsby-starter-project.git",
  // option to whitelist various data
  "whitelist": {
    // the keyname `all` will be used for whitelist defaults
    "all": {
      "abi": true,
      "methods": true,
      "bytecode": false, // bytecode is false or undefined, it won't be shown
      "source": false // source is false or undefined, won't be shown
    },
    "DigixMath": {
      "source": true // source code uniquely shown for this contract, bytecode still hidden
    }
  }
}
```

### Command Line Interface

You can also override these options by passing them to a command tool.

Unless you override them, default arguments will be used:

- `doxity init  --target --source` (you can also pass any arguments to save them to `.doxityrc`)
- `doxity build --target --src --dir`
- `doxity develop --target`
- `doxity publish --target --out`

**Protip:** If you are installing locally, you could add the following to your `package.json`:

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

* 0.1.0
  * Options to hide / whitelist source files & binaries
  * Code highlighting
  * Demo Site
* 1.0.0
  * AST parsing: render params that are in devdocs but not ABI (e.g. methods)
  * Tests
  * Sourcemaps, Hash Signatures
* 1.x
  * Live web3 instance for testing?

## License

BSD-3-Clause 2016
