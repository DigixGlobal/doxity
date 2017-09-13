'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-disable global-require */

exports.default = function (opts) {
  var output = process.env.PWD + '/' + opts.target + '/' + opts.dir;
  if (!_fs2.default.existsSync(output)) {
    throw new Error('Output directory ' + output + ' not found, are you in the right directory?');
  }
  // clear out the output folder (remove all json files)
  _glob2.default.sync(output + '/*.json').forEach(function (file) {
    return _fs2.default.unlinkSync(file);
  });
  // get the natspec
  return (0, _solc2.default)(opts.src).then(function (_ref2) {
    var contracts = _ref2.contracts;

    compile(_extends({}, opts, { output: output, contracts: contracts }));
  });
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _toml = require('toml');

var _toml2 = _interopRequireDefault(_toml);

var _tomlifyJ = require('tomlify-j0.4');

var _tomlifyJ2 = _interopRequireDefault(_tomlifyJ);

var _constants = require('../constants');

var _solc = require('./solc');

var _solc2 = _interopRequireDefault(_solc);

var _parseAbi = require('./parse-abi');

var _parseAbi2 = _interopRequireDefault(_parseAbi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function compile(_ref) {
  var whitelist = _ref.whitelist,
      contracts = _ref.contracts,
      output = _ref.output,
      target = _ref.target,
      version = _ref.version;

  // do we need to check for whitelist?
  var defaultWhitelist = { source: true, bytecode: true, abi: true, methods: true };
  // if (whitelist && Object.keys(whitelist).length > 0) {
  //   defaultWhitelist = whitelist.all || {};
  // }
  process.stdout.write('Generating output for ' + Object.keys(contracts).length + ' contracts...\n');
  Object.keys(contracts).forEach(function (contractName) {
    var contract = contracts[contractName];
    // determine whether we should be skipped
    if (whitelist && !whitelist[contractName]) {
      return null;
    }
    // otherwise, pick up the defaultss
    var myWhitelist = _extends({}, defaultWhitelist, (whitelist || {})[contractName]);
    // get the source file
    var fileName = contract.fileName;

    if (!fileName) {
      return null;
    } // there was an error parsing...
    // TODO fix me
    // const interaction = {};
    // get deploy info from truffle
    // let address;
    // if (interaction) {
    //   try {
    //     const instance = require(`${process.env.PWD}/build/contracts/${contractName}.sol.js`);
    //     address = instance.all_networks[interaction.network].address;
    //   } catch (e) { /* do noithing */ }
    // }
    var bin = contract.bin,
        opcodes = contract.opcodes,
        abi = contract.abi,
        devdoc = contract.devdoc;
    var author = devdoc.author,
        title = devdoc.title;

    var data = {
      author: author,
      title: title,
      fileName: fileName.replace(process.env.PWD, ''),
      // address,
      name: contractName,
      // only pass these if they are whitelisted
      abi: myWhitelist.abi && abi,
      bin: myWhitelist.bytecode && bin,
      opcodes: myWhitelist.bytecode && opcodes,
      source: myWhitelist.source && _fs2.default.readFileSync(fileName).toString(),
      abiDocs: myWhitelist.methods && (0, _parseAbi2.default)(contract)
    };
    return _fs2.default.writeFileSync(output + '/' + contractName + '.json', JSON.stringify(data) + '\n');
  });

  // TODO find in a better way?
  var pkgConfig = {};
  try {
    pkgConfig = JSON.parse(_fs2.default.readFileSync(process.env.PWD + '/package.json'));
  } catch (e) {
    // console.log('package.json not found, add one for more output');
  }

  var config = {
    compiler: version,
    name: pkgConfig.name,
    license: pkgConfig.license,
    version: pkgConfig.version,
    description: pkgConfig.description,
    homepage: pkgConfig.homepage,
    interaction: {}, // TODO implement
    author: pkgConfig.author && pkgConfig.author.name || pkgConfig.author,
    buildTime: new Date()
  };

  var configFile = process.env.PWD + '/' + target + '/' + _constants.CONFIG_FILE;

  try {
    // try marginging with old config
    config = _extends({}, _toml2.default.parse(_fs2.default.readFileSync(configFile).toString()), config);
  } catch (e) {
    /* do nothing */
    // console.log('Error copying config');
  }

  try {
    // try marginging with doxity config
    config = _extends({}, config, JSON.parse(_fs2.default.readFileSync(process.env.PWD + '/' + _constants.DOXITYRC_FILE).toString()));
  } catch (e) {} /* do nothing */

  // write the config
  if (_fs2.default.existsSync(configFile)) {
    _fs2.default.unlinkSync(configFile);
  }
  _fs2.default.writeFileSync(configFile, '' + (0, _tomlifyJ2.default)(config));

  // copy the readme
  try {
    var readmeFile = _glob2.default.sync(process.env.PWD + '/' + _constants.README_FILE, { nocase: true })[0];
    var readmeTarget = process.env.PWD + '/' + target + '/' + _constants.README_TARGET;
    if (_fs2.default.existsSync(readmeTarget)) {
      _fs2.default.unlinkSync(readmeTarget);
    }
    _fs2.default.writeFileSync(readmeTarget, _fs2.default.readFileSync(readmeFile));
  } catch (e) {
    /* do nothing */
    // console.log('Readme file not found, ignoring...');
  }
  process.stdout.write('  done!\n');
}