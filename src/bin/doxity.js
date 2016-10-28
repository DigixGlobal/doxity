#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import minimist from 'minimist';
import * as Doxity from '../index';

const args = minimist(process.argv.slice(2));

// get json version

if (!args._[0]) {
  const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json')).toString());
  console.log(`
Doxity v${version}

Commands:

init       Initialize your project for use with doxity
compile    Compile solidity contracts to generate docs data
develop    Spin up a development server for customizing output
publish    Generate static HTML documenation
build      compile + publish

Parameters:

--target   Gatsby project source files directory
--src      Folder that contains the contracts you want to compile
--dir      Folder in gatsby project to dump contract data
--out      Folder to output the generated html (relative to project root)
--source   Git url for bootstrapping the gatsby project
  `);
  process.exit();
} else {
  Doxity.default[args._[0]](args);
}
