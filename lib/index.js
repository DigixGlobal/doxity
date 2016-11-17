'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _constants = require('./constants');

var _init = require('./init');

var _init2 = _interopRequireDefault(_init);

var _compile = require('./compile');

var _compile2 = _interopRequireDefault(_compile);

var _develop = require('./develop');

var _develop2 = _interopRequireDefault(_develop);

var _publish = require('./publish');

var _publish2 = _interopRequireDefault(_publish);

var _build = require('./build');

var _build2 = _interopRequireDefault(_build);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var methods = {
  compile: _compile2.default,
  init: _init2.default,
  develop: _develop2.default,
  publish: _publish2.default,
  build: _build2.default
};

function populateArguments(passed) {
  // cruft from minimist
  delete passed._;
  // fallback to defaults
  var defaults = {
    target: _constants.DEFAULT_TARGET,
    src: _constants.DEFAULT_SRC_DIR,
    dir: _constants.DEFAULT_PAGES_DIR,
    source: _constants.DEFAULT_SOURCE,
    out: _constants.DEFAULT_PUBLISH_DIR
  };
  // merge with .doxityrc
  var saved = {};
  try {
    saved = JSON.parse(_fs2.default.readFileSync(process.env.PWD + '/' + _constants.DOXITYRC_FILE).toString());
  } catch (e) {
    console.log('.doxityrc not found or unreadable');
  }
  // return merge
  return _extends({}, defaults, saved, passed);
}
// wire up defaults
var wrappedMethods = {};
Object.keys(methods).forEach(function (key) {
  wrappedMethods[key] = function (args) {
    var newArgs = populateArguments(args);
    return methods[key](newArgs);
  };
});

exports.default = wrappedMethods;