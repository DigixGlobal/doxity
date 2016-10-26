'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearDirectory = clearDirectory;

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

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