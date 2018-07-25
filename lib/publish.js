'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var target = _ref.target,
      out = _ref.out;

  function isWindows() {
    return process.platform === "win32";
  };

  // TODO check folder exists...
  var cwd = _path2.default.join(process.env.PWD, target);
  var outputFolder = _path2.default.join(cwd, '/public');
  var destFolder = _path2.default.join(process.env.PWD, out);
  (0, _helpers.clearDirectory)(destFolder).then(function () {
    var npmCommand = isWindows() ? "npm.cmd" : "npm";
    var runDev = _child_process2.default.spawn(npmCommand, ['run', 'build'], { cwd: cwd });
    runDev.stdout.pipe(process.stdout);
    runDev.stderr.pipe(process.stderr);
    runDev.on('close', function () {
      _fs2.default.renameSync(outputFolder, destFolder);
      process.stdout.write('Published Documentation to ' + destFolder + '\n');
      process.exit();
    });
  });
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }