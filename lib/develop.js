'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var target = _ref.target;

  // TODO check we're in ther right folder.. ?
  var runDev = _child_process2.default.spawn('npm', ['run', 'develop'], { cwd: process.env.PWD + '/' + target });
  runDev.stdout.pipe(process.stdout);
  runDev.stderr.pipe(process.stderr);
  runDev.on('close', function () {
    return process.exit();
  });
};

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }