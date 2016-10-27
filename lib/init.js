'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (args) {
  var source = args.source,
      target = args.target;
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
      var doxityrcFile = process.env.PWD + '/' + _constants.DOXITYRC_FILE;
      // overwrite doxityrc file
      if (_fs2.default.existsSync(doxityrcFile)) {
        _fs2.default.unlinkSync(doxityrcFile);
      }
      _fs2.default.writeFileSync(doxityrcFile, JSON.stringify(args, null, 2) + '\n');

      process.stdout.write('Doxity is initialized! Now run `doxity compile`\n');
      process.exit();
    });
  });
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _nodegit = require('nodegit');

var _nodegit2 = _interopRequireDefault(_nodegit);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _helpers = require('./helpers');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }