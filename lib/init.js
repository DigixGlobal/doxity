'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$source = _ref.source,
      source = _ref$source === undefined ? _constants.DEFAULT_SOURCE : _ref$source,
      _ref$target = _ref.target,
      target = _ref$target === undefined ? _constants.DEFAULT_TARGET : _ref$target;

  // TODO check folder exists...
  var absoluteTarget = process.env.PWD + '/' + target;
  // clear the target dir
  (0, _helpers.clearDirectory)(absoluteTarget).then(function () {
    // clone the repo
    process.stdout.write('Cloning ' + source + '...');
    return _nodegit2.default.Clone(source, absoluteTarget);
  }).then(function () {
    // remove the `.git` folder
    process.stdout.write('\n');
    return (0, _helpers.clearDirectory)(absoluteTarget + '/.git');
  }).then(function () {
    // install the deps
    process.stdout.write('Setting up project with `cd ' + absoluteTarget + ' && npm install --verbose`...\n');
    var npmInstall = _child_process2.default.spawn('npm', ['--verbose', 'install'], { cwd: absoluteTarget });
    npmInstall.stdout.pipe(process.stdout);
    npmInstall.stderr.pipe(process.stderr);
    npmInstall.on('close', function () {
      process.stdout.write('Doxity is initialized! Now run `doxity build`\n');
      process.exit();
    });
  });
};

var _nodegit = require('nodegit');

var _nodegit2 = _interopRequireDefault(_nodegit);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _constants = require('./constants');

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }