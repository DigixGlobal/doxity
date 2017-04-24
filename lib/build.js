'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (args) {
  (0, _compile2.default)(args).then(function () {
    (0, _publish2.default)(args);
  });
};

var _compile = require('./compile');

var _compile2 = _interopRequireDefault(_compile);

var _publish = require('./publish');

var _publish2 = _interopRequireDefault(_publish);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }