# Doxity

0.4.0 now works with truffle! 💻

### Documentation Generator for Solidity

[Demo Site](https://hitchcott.github.io/doxity-demo/docs/MetaCoin/)

Uses [gatsby](https://github.com/gatsbyjs/gatsby) to generate beautiful Solidity docs automatically via [natspec](https://github.com/ethereum/wiki/wiki/Ethereum-Natural-Specification-Format).

## Features

* Automatically document contracts and methods from your code
* Generate static HTML documentation websites that can be served directly from github
* Fully customizable output using React
* Minimalist UX from [semantic-ui](https://github.com/Semantic-Org/Semantic-UI-React)
* Solidity Syntax highlighting
* For each contract, options for whitelisting
  * Methods Documentation
  * ABI
  * Bytecode
  * Source Code

![Doxity Screenshot](http://i.imgur.com/4ojFGfs.png)

## Installation

You can install `@digix/doxity` globally or locally in your project.

You'll also need `solc 0.4.X` ([native](http://solidity.readthedocs.io/en/develop/installing-solidity.html#binary-packages) until [solc-js is supported](https://github.com/ethereum/solc-js/issues/70)) and libssl-dev installed on your machine.

```bash
# globally
npm install -g @digix/doxity
# or within project folder
npm install --save-dev @digix/doxity
```

## Quickstart

1. Have a project that contains natspecced* `.sol` contracts in a `contracts` directory, a `package.json` and `README.md`.
1. `doxity init` will clone and set up the boilerplate gatsby project - files found in `./scripts/doxity`
1. `doxity build` will generate static HTML containing documentation to `./docs`

**Customize Markup and Publish it to github**

1. `doxity develop` will start a development server for editing gatsby project
1. `doxity compile` will compile the contracts and update the contract data
1. Ensure you have set `linkPrefix` in `scripts/doxity/config.toml` to be equal to your repo's name (e.g. `/my-project`)
1. `doxity publish` will generate static HTML containing documentation to `./docs`
1. After publishing, you'll end up with a `./docs` folder in your project which can be easily deployed
1. Push it to `master` on github
1. Go to your repo options, update 'Github Pages -> Set Source' to 'master branch /docs folder'
1. Your documentation is live! Why not set up a Travis CI script to automate that whenever you commit?

\* N.B. Currently Solidity doesn't support multiple `@return` values. Pass it a JSON object until it's patched. EG:

```javascript
// natspec example - appears above each method
/**
@notice Get user's information from their EOA/Contract address
@dev Some more techncial explanation here
@param _account the EOA or contract address associated with the user
@param _anotherParam this is just an example of passing a second param
@return {
  "_feeaccount": "The contract address for storage fee payments",
  "_recastaccount": "The contract address for recasting tokens",
  "_assetcount": "The number of items associated with this account",
  "_assetstartindex": "The starting index of the user's items collection"
}
*/
function getUser(address _account) ...
```

## Usage

### `.doxityrc`

You can configure all of doxity's options using a `.doxityrc` file at the root of your project, with the following structure:

```javascript
// .doxityrc
{
  // gatsby project source files directory
	"target": "scripts/doxity",
  // folder that contains the contracts you want to compile
	"src": "contracts/*",
  // folder in gatsby project to dump contract data
	"dir": "pages/docs",
  // folder to output the generated html (relative to project root)
	"out": "docs",
  // tarball for bootstrapping the gatsby project
  "source": "https://github.com/DigixGlobal/doxity-gatsby-starter-project/archive/9445d59056058159ce25d7cd1643039523718553.tar.gz",
  // for truffle projects, you can get deployed contract info
  // use https://github.com/DigixGlobal/doxity-gatsby-starter-project/archive/74df3b2b7a2484714540e4a9153a8f1d0f95a380.tar.gz for experimental interactive mode!
  "interaction": {
    "network": "2",
    "providerUrl": "https://morden.infura.io/sign_up_to_get_a_hash"
  },
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

- `doxity init  --target --source` (with init, you can also pass any arguments to save them to `.doxityrc`)
- `doxity compile --target --src --dir`
- `doxity develop --target`
- `doxity publish --target --out`

When passing to `src` in the CLI, wrap the filename in quotes; e.g. `--src "contracts/*"` - it is passed directly to `solc`.

**Protip:** If you are installing locally, you could add the following to your `package.json`:

```javascript
"scripts" : {
  "docs:init": "node_modules/.bin/doxity init", // add your custom arguments (see API below)
  "docs:compile": "node_modules/.bin/doxity compile",
  "docs:develop": "node_modules/.bin/doxity develop",
  "docs:publish": "node_modules/.bin/doxity publish",
  "docs:build": "node_modules/.bin/doxity build", // compile + publish
  ...
},
```

You can then use `npm run docs:[command]` as a proxy for `doxity [command]`.

## TODO

* 1.0.0
  * AST parsing (pending solidity update)
    * pragma version
    * Imports
    * Modifiers, variables, private functions, etc.
    * Sourcemaps
    * Inline Code Snippets
  * Tree view
  * Methods filtering
  * Tests
* 1.x
  * Multiple Versioning
  * Pudding integration? Automatically generate forms + web3 instance for testing via GUI?

## License

BSD-3-Clause 2016
