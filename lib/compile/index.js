'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (_ref) {
  var target = _ref.target,
      src = _ref.src,
      dir = _ref.dir,
      whitelist = _ref.whitelist;

  var output = process.env.PWD + '/' + target + '/' + dir;
  if (!_fs2.default.existsSync(output)) {
    throw new Error('Output directory ' + output + ' not found, are you in the right directory?');
  }
  // clear out the output folder (remove all json files)
  _glob2.default.sync(output + '/*.json').forEach(function (file) {
    return _fs2.default.unlinkSync(file);
  });
  // TODO find in a better way?
  var pkgJson = _fs2.default.readFileSync(process.env.PWD + '/package.json');
  var pkgConfig = pkgJson ? JSON.parse(pkgJson) : {};
  // TODO implement sourcemaps
  // abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc
  var exec = 'solc --combined-json abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc ' + src;
  console.log(exec);

  var _JSON$parse = JSON.parse(_child_process2.default.execSync(exec)),
      sources = _JSON$parse.sources,
      contracts = _JSON$parse.contracts,
      version = _JSON$parse.version;
  // for each contract create a json file in the target directory
  // do we need to check for whitelist?


  var defaultWhitelist = { source: true, bytecode: true, abi: true, methods: true };
  if (whitelist && Object.keys(whitelist).length > 0) {
    defaultWhitelist = whitelist.all || {};
  }
  process.stdout.write('Generating output for ' + Object.keys(sources).length + ' files...\n');
  Object.keys(contracts).forEach(function (contractName) {
    // determine whether we should be skipped
    var myWhitelist = _extends({}, defaultWhitelist, (whitelist || {})[contractName]);
    // get the source file
    var fileName = Object.keys(sources).find(function (name) {
      var contractDefinition = sources[name].AST.children.find(function (c) {
        return c.name === 'ContractDefinition';
      });
      return contractDefinition.attributes.name === contractName;
    });
    if (!fileName) {
      process.stdout.write('Could not find source code for: ' + contractName + ', skipping\n');
      return null;
    }
    var contract = contracts[contractName];
    var bin = contract.bin,
        opcodes = contract.opcodes,
        abi = contract.abi,
        devdoc = contract.devdoc;

    var _JSON$parse2 = JSON.parse(devdoc),
        author = _JSON$parse2.author,
        title = _JSON$parse2.title;

    var data = {
      author: author,
      title: title,
      fileName: fileName,
      name: contractName,
      // only pass these if they are whitelisted
      abi: myWhitelist.abi && JSON.parse(abi),
      bin: myWhitelist.bytecode && bin,
      opcodes: myWhitelist.bytecode && opcodes,
      source: myWhitelist.source && _fs2.default.readFileSync(process.env.PWD + '/' + fileName).toString(),
      abiDocs: myWhitelist.methods && (0, _parseAbi2.default)(contract)
    };
    delete data.methods;
    _fs2.default.writeFileSync(output + '/' + contractName + '.json', JSON.stringify(data) + '\n');
  });

  var configFile = process.env.PWD + '/' + target + '/' + _constants.CONFIG_FILE;
  // todo inherit from .doxityrc
  var config = {
    compiler: version,
    name: pkgConfig.name,
    license: pkgConfig.license,
    version: pkgConfig.version,
    description: pkgConfig.description,
    homepage: pkgConfig.homepage,
    author: pkgConfig.author,
    buildTime: new Date()
  };
  try {
    // try marginging with old config
    config = _extends({}, _toml2.default.parse(_fs2.default.readFileSync(process.env.PWD + '/' + target + '/' + _constants.CONFIG_FILE).toString()), config);
  } catch (e) {
    /* do nothing */
    console.log('Error copying config', e);
  }
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
    console.log('Error copying readme file', e);
  }
  process.stdout.write('  done!\n');
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _toml = require('toml');

var _toml2 = _interopRequireDefault(_toml);

var _tomlifyJ = require('tomlify-j0.4');

var _tomlifyJ2 = _interopRequireDefault(_tomlifyJ);

var _constants = require('../constants');

var _parseAbi = require('./parse-abi');

var _parseAbi2 = _interopRequireDefault(_parseAbi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }