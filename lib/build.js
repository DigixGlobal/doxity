'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (_ref) {
  var target = _ref.target,
      src = _ref.src,
      dir = _ref.dir;

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
  var exec = 'solc --combined-json abi,bin,devdoc,interface,opcodes,userdoc ' + src + '/**/*';

  var _JSON$parse = JSON.parse(_child_process2.default.execSync(exec)),
      contracts = _JSON$parse.contracts,
      compiler = _objectWithoutProperties(_JSON$parse, ['contracts']);
  // find the source file and save the page data


  var sources = _glob2.default.sync(process.env.PWD + '/' + src + '/**/*');
  // for each contract create a json file in the target directory
  process.stdout.write('Generating code for ' + sources.length + ' contracts...');
  Object.keys(contracts).forEach(function (contractName) {
    var sourceFile = sources.find(function (fileName) {
      var split = fileName.split('/');
      return contractName + '.sol' === split[split.length - 1];
    });
    // ensure the contract exists
    if (sourceFile) {
      (function () {
        var contract = contracts[contractName];
        var bin = contract.bin,
            opcodes = contract.opcodes;

        var contractDevDoc = JSON.parse(contract.devdoc);
        var contractUserDoc = JSON.parse(contract.userdoc);

        var _JSON$parse2 = JSON.parse(contract.devdoc),
            author = _JSON$parse2.author,
            title = _JSON$parse2.title;

        var abi = JSON.parse(contract.abi);
        var data = {
          author: author,
          title: title,
          abi: abi,
          bin: bin,
          opcodes: opcodes,
          fileName: sourceFile.replace(process.env.PWD, ''),
          name: contractName,
          source: _fs2.default.readFileSync(sourceFile).toString(),
          abiDocs: abi.map(function (methodAbi) {
            // get find relevent docs
            var devDocs = getDocs(methodAbi.name, contractDevDoc) || {};
            var userDocs = getDocs(methodAbi.name, contractUserDoc) || {};
            // map abi inputs to devdoc inputs
            var params = devDocs.params || {};
            var inputs = methodAbi.inputs.map(function (param) {
              return _extends({}, param, { description: params[param.name] });
            });
            // don't write this
            delete devDocs.params;

            // START HACK workaround pending https://github.com/ethereum/solidity/issues/1277
            // TODO map outputs properly once compiler splits them out
            // in the meantime, use json array
            // parse devDocs.return as a json object
            var outputs = void 0;
            try {
              (function () {
                var outputParams = JSON.parse(devDocs.return);
                outputs = methodAbi.outputs.map(function (param) {
                  return _extends({}, param, { description: outputParams[param.name] });
                });
              })();
            } catch (e) {
              outputs = methodAbi.outputs;
            }
            // END HACK

            return _extends({}, devDocs, userDocs, methodAbi, {
              inputs: inputs,
              outputs: outputs
            });
          })
        };
        delete data.methods;
        _fs2.default.writeFileSync(output + '/' + contractName + '.json', JSON.stringify(data) + '\n');
      })();
    }
  });

  var configFile = process.env.PWD + '/' + target + '/' + _constants.CONFIG_FILE;
  // todo inherit from .doxityrc
  var config = {
    compiler: compiler.version,
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

  process.stdout.write('\rDocumentation data is created! Now use `doxity publish` or `doxity develop`\n');
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

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getDocs(name, doc) {
  // TODO add docs anyway if they are not found... ? E.G. for methods
  return doc.methods[Object.keys(doc.methods).find(function (signature) {
    return name === signature.split('(')[0];
  })];
}