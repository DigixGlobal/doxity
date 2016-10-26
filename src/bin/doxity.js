#!/usr/bin/env node
import minimist from 'minimist';
import * as Doxity from '../index';

const args = minimist(process.argv.slice(2));

Doxity[args._[0]](args);
