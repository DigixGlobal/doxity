'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (args) {
  var source = args.source,
      target = args.target;
  // TODO check folder exists...

  var absoluteTarget = process.env.PWD + '/' + target;
  var tmpTarget = _path2.default.resolve(process.env.PWD + '/' + target + '/../doxity-tmp-' + new Date());
  // clear the target dir
  (0, _helpers.clearDirectory)(absoluteTarget).then(function () {
    // clone the repo
    process.stdout.write('Getting ' + source + '...\n');
    // pipe package to thingy.
    return new Promise(function (resolve) {
      _request2.default.get(source).pipe((0, _tar2.default)().createWriteStream(tmpTarget)).on('finish', resolve);
    });
  })
  // rename the downloaded folder to doxity
  .then(function () {
    _fs2.default.renameSync(tmpTarget + '/' + _fs2.default.readdirSync(tmpTarget)[0], absoluteTarget);
    _fs2.default.rmdirSync(tmpTarget);
  }).then(function () {
    // fancy spinner
    var i = 0;
    var seq = '⣷⣯⣟⡿⢿⣻⣽⣾'.split('');
    var message = 'Setting up doxity project with npm install. This may take a while...';
    var spinner = setInterval(function () {
      i++;
      if (i >= seq.length) {
        i = 0;
      }
      process.stdout.write('\r' + seq[i] + ' ' + message);
    }, 1000 / 24);
    // install the deps
    var npmInstall = _child_process2.default.spawn('npm', ['install'], { cwd: absoluteTarget });
    npmInstall.stdout.removeAllListeners('data');
    npmInstall.stderr.removeAllListeners('data');
    npmInstall.stdout.pipe(process.stdout);
    npmInstall.stderr.pipe(process.stderr);
    npmInstall.on('close', function () {
      clearInterval(spinner);
      var doxityrcFile = process.env.PWD + '/' + _constants.DOXITYRC_FILE;
      // overwrite doxityrc file
      if (_fs2.default.existsSync(doxityrcFile)) {
        _fs2.default.unlinkSync(doxityrcFile);
      }
      _fs2.default.writeFileSync(doxityrcFile, JSON.stringify(args, null, 2) + '\n');

      process.stdout.write('Doxity is initialized! Now run `doxity build`\n');
      process.exit();
    });
  });
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _tar = require('tar.gz');

var _tar2 = _interopRequireDefault(_tar);

var _helpers = require('./helpers');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }