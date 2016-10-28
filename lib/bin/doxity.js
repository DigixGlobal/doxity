#!/usr/bin/env node
'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _index = require('../index');

var Doxity = _interopRequireWildcard(_index);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var args = (0, _minimist2.default)(process.argv.slice(2));

// get json version

if (!args._[0]) {
  var _JSON$parse = JSON.parse(_fs2.default.readFileSync(_path2.default.join(__dirname, '../../package.json')).toString()),
      version = _JSON$parse.version;

  console.log('\nDoxity v' + version + '\n\nCommands:\n\ninit       Initialize your project for use with doxity\ncompile    Compile solidity contracts to generate docs data\ndevelop    Spin up a development server for customizing output\npublish    Generate static HTML documenation\nbuild      compile + publish\n\nParameters:\n\n--target   Gatsby project source files directory\n--src      Folder that contains the contracts you want to compile\n--dir      Folder in gatsby project to dump contract data\n--out      Folder to output the generated html (relative to project root)\n--source   Git url for bootstrapping the gatsby project\n  ');
  process.exit();
} else {
  Doxity.default[args._[0]](args);
}