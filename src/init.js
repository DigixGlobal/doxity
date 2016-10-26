import Git from 'nodegit';
import childProcess from 'child_process';

import { DEFAULT_SOURCE, DEFAULT_TARGET } from './constants';
import { clearDirectory } from './helpers';

export default function ({ source = DEFAULT_SOURCE, target = DEFAULT_TARGET } = {}) {
  // TODO check folder exists...
  const absoluteTarget = `${process.env.PWD}/${target}`;
  // clear the target dir
  clearDirectory(absoluteTarget)
  .then(() => {
    // clone the repo
    process.stdout.write(`Cloning ${source}...`);
    return Git.Clone(source, absoluteTarget);
  })
  .then(() => {
    // remove the `.git` folder
    process.stdout.write(`\n`);
    return clearDirectory(`${absoluteTarget}/.git`);
  })
  .then(() => {
    // install the deps
    process.stdout.write(`Setting up project with \`cd ${absoluteTarget} && npm install --verbose\`...\n`);
    const npmInstall = childProcess.spawn('npm', ['--verbose', 'install'], { cwd: absoluteTarget });
    npmInstall.stdout.pipe(process.stdout);
    npmInstall.stderr.pipe(process.stderr);
    npmInstall.on('close', () => {
      process.stdout.write('Doxity is initialized! Now run `doxity build`\n');
      process.exit();
    });
  });
}
