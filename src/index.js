import fs from 'fs';

import {
  DOXITYRC_FILE,
  DEFAULT_SOURCE,
  DEFAULT_TARGET,
  DEFAULT_PAGES_DIR,
  DEFAULT_SRC_DIR,
  DEFAULT_PUBLISH_DIR,
} from './constants';

import init from './init';
import compile from './compile';
import develop from './develop';
import publish from './publish';
import build from './build';

const methods = {
  compile,
  init,
  develop,
  publish,
  build,
};

function populateArguments(passed) {
  // cruft from minimist
  delete passed._;
  // fallback to defaults
  const defaults = {
    target: DEFAULT_TARGET,
    src: DEFAULT_SRC_DIR,
    dir: DEFAULT_PAGES_DIR,
    source: DEFAULT_SOURCE,
    out: DEFAULT_PUBLISH_DIR,
  };
  // merge with .doxityrc
  let saved = {};
  try {
    saved = JSON.parse(fs.readFileSync(`${process.env.PWD}/${DOXITYRC_FILE}`).toString());
  } catch (e) {
    console.log('.doxityrc not found or unreadable');
  }
  // return merge
  return { ...defaults, ...saved, ...passed };
}
// wire up defaults
const wrappedMethods = {};
Object.keys(methods).forEach((key) => {
  wrappedMethods[key] = (args) => {
    const newArgs = populateArguments(args);
    return methods[key](newArgs);
  };
});

export default wrappedMethods;
