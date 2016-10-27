import fs from 'fs';
import Git from 'nodegit';
import childProcess from 'child_process';

import { clearDirectory } from './helpers';

import { DOXITYRC_FILE } from './constants';

export default function (args) {
  const { source, target } = args;
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
      const doxityrcFile = `${process.env.PWD}/${DOXITYRC_FILE}`;
      // overwrite doxityrc file
      if (fs.existsSync(doxityrcFile)) { fs.unlinkSync(doxityrcFile); }
      fs.writeFileSync(doxityrcFile, `${JSON.stringify(args, null, 2)}\n`);

      process.stdout.write('Doxity is initialized! Now run `doxity build`\n');
      process.exit();
    });
  });
}
