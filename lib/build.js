'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (_ref) {
  var _ref$target = _ref.target,
      target = _ref$target === undefined ? _constants.DEFAULT_TARGET : _ref$target,
      _ref$src = _ref.src,
      src = _ref$src === undefined ? _constants.DEFAULT_SRC_DIR : _ref$src,
      _ref$dir = _ref.dir,
      dir = _ref$dir === undefined ? _constants.DEFAULT_PAGES_DIR : _ref$dir;

  // TODO configurable input
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
  var message = 'Generating code for ' + sources.length + ' contracts...';
  process.stdout.write(message);
  Object.keys(contracts).forEach(function (contractName) {
    var sourceFile = sources.find(function (fileName) {
      var split = fileName.split('/');
      return contractName + '.sol' === split[split.length - 1];
    });
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
          fileName: sourceFile,
          name: contractName,
          source: _fs2.default.readFileSync(sourceFile).toString(),
          abiDocs: abi.map(function (methodAbi) {
            var devDocs = getDocs(methodAbi.name, contractDevDoc) || {};
            var userDocs = getDocs(methodAbi.name, contractUserDoc) || {};
            // map abi methods to devdoc methods
            if (devDocs.params) {
              methodAbi.inputs = methodAbi.inputs.map(function (param) {
                param.description = devDocs.params[param.name];
                return param;
              });
              delete devDocs.params;
              // TODO map outputs once compiler splits them out
              // const userMethods = userDocs.methods;
              // if (userMethods) { delete userMethods.methods; }
            }
            return _extends({}, devDocs, userDocs, methodAbi);
          })
        };
        delete data.methods;
        _fs2.default.writeFileSync(output + '/' + contractName + '.json', JSON.stringify(data));
      })();
    }
  });

  process.stdout.write('\r' + message.split('').fill(' ').join('') + '\r');
  process.stdout.write('Documentation data is created! Now use `doxify publish` or `doxify develop`\n');

  var config = {
    compiler: compiler.version,
    name: pkgConfig.name,
    version: pkgConfig.version,
    description: pkgConfig.description,
    homepage: pkgConfig.homepage
  };
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getDocs(name, doc) {
  return doc.methods[Object.keys(doc.methods).find(function (signature) {
    return name === signature.split('(')[0];
  })];
}