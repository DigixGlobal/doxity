'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (src) {
  function expandPath(src) {
    if (!pathEndsWithWildcard(src)) {
      return src;
    }

    var basePath = removeLastCharacter(src);
    var files = traverseDir(basePath, []);
    return files.join(" ");
  };

  function pathEndsWithWildcard(path) {
    return path[path.length - 1] === "*";
  };

  function removeLastCharacter(text) {
    return text.substring(0, text.length - 1);
  };

  function traverseDir(dir, files) {
    files = files || [];
    var dirContents = _fs2.default.readdirSync(dir);
    dirContents.forEach(function (dirEntry) {
      var fileName = _path2.default.join(dir, dirEntry);
      if (_fs2.default.statSync(fileName).isDirectory()) {
        files = traverseDir(fileName, files);
      } else {
        files.push(fileName);
      }
    });
    return files;
  };

  function extractFilenameFromContract(contractKey) {
    var separatorPosition = contractKey.lastIndexOf(":");
    return contractKey.substring(0, separatorPosition);
  };

  function extractNameFromContract(contractKey) {
    var separatorPosition = contractKey.lastIndexOf(":");
    return contractKey.substring(separatorPosition + 1);
  };

  // detect if we're in a truffle project
  return new Promise(function (resolve) {
    if (_fs2.default.existsSync(process.env.PWD + '/truffle.js')) {
      var config = _truffleConfig2.default.default();
      config.resolver = new _truffleResolver2.default(config);
      config.rawData = true;
      _truffleCompile2.default.all(config, function (err, res) {
        if (err) {
          throw err;
        }
        resolve({
          contracts: Object.keys(res).reduce(function (o, k) {
            var _res$k$rawData = res[k].rawData,
                metadata = _res$k$rawData.metadata,
                data = _objectWithoutProperties(_res$k$rawData, ['metadata']);

            try {
              var parsed = JSON.parse(metadata);
              var fN = Object.keys(parsed.settings.compilationTarget)[0];
              data.fileName = fN.indexOf(process.env.PWD) === 0 ? fN : process.env.PWD + '/node_modules/' + fN;
              data.output = parsed.output;
            } catch (e) {
              console.log('\u26A0\uFE0F Error parsing Contract: ' + k);
            }
            return _extends({}, o, _defineProperty({}, k, data));
          }, {})
        });
      });
    } else {
      var exec = 'solc --combined-json abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc ' + expandPath(src);
      var res = JSON.parse(_child_process2.default.execSync(exec));
      resolve({
        contracts: Object.keys(res.contracts).reduce(function (o, k) {
          var contract = res.contracts[k];
          var fileName = extractFilenameFromContract(k);
          var contractName = extractNameFromContract(k);

          if (!_path2.default.isAbsolute(fileName)) {
            fileName = _path2.default.join(process.env.PWD, fileName);
          }

          return _extends({}, o, _defineProperty({}, contractName, _extends({}, contract, {
            fileName: fileName,
            abi: JSON.parse(contract.abi),
            devdoc: JSON.parse(contract.devdoc),
            userdoc: JSON.parse(contract.userdoc)
          })));
        }, {})
      });
    }
  });
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _truffleConfig = require('truffle-config');

var _truffleConfig2 = _interopRequireDefault(_truffleConfig);

var _truffleResolver = require('truffle-resolver');

var _truffleResolver2 = _interopRequireDefault(_truffleResolver);

var _truffleCompile = require('truffle-compile');

var _truffleCompile2 = _interopRequireDefault(_truffleCompile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }