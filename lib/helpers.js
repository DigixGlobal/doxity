'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearDirectory = clearDirectory;
exports.getFunctionSignature = getFunctionSignature;

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _keccakjs = require('keccakjs');

var _keccakjs2 = _interopRequireDefault(_keccakjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function clearDirectory(target) {
  return new Promise(function (resolve, reject) {
    (0, _mkdirp2.default)(target, function () {
      (0, _rimraf2.default)(target, function (err) {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  });
}

function getFunctionSignature(signature) {
  return new _keccakjs2.default(256).update(signature).digest('hex').substr(0, 8);
}