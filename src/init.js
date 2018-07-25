import fs from 'fs';
import childProcess from 'child_process';
import request from 'request';
import path from 'path';
import targz from 'tar.gz';

import { clearDirectory } from './helpers';

import { DOXITYRC_FILE } from './constants';

export default function (args) {
  const { source, target } = args;
  // TODO check folder exists...

  function isWindows() {
    return process.platform === "win32";
  };

  function addLeadingZeroIfNeeded(value) {
    if (value < 10) {
      return "0" + value;
    } else {
      return "" + value;
    }
  };

  const absoluteTarget = path.join(process.env.PWD, target);

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = addLeadingZeroIfNeeded(now.getUTCMonth());
  const day = addLeadingZeroIfNeeded(now.getUTCDate());
  const hours = addLeadingZeroIfNeeded(now.getUTCHours());
  const minutes = addLeadingZeroIfNeeded(now.getUTCMinutes());
  const seconds = addLeadingZeroIfNeeded(now.getUTCSeconds());
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

  const tmpTarget = path.resolve(path.join(process.env.PWD, target, '/../doxity-tmp-' + timestamp));
  // clear the target dir
  clearDirectory(absoluteTarget)
  .then(() => {
    // clone the repo
    process.stdout.write(`Getting ${source}...\n`);
    // pipe package to thingy.
    return new Promise((resolve) => {
      request.get(source)
      .pipe(targz().createWriteStream(tmpTarget))
      .on('finish', resolve);
    });
  })
  // rename the downloaded folder to doxity
  .then(() => {
    const tempTargetFilename = path.join(tmpTarget, fs.readdirSync(tmpTarget)[0]);
    fs.renameSync(tempTargetFilename, absoluteTarget);
    fs.rmdirSync(tmpTarget);
  })
  .then(() => {
    // fancy spinner
    let i = 0;
    const seq = '⣷⣯⣟⡿⢿⣻⣽⣾'.split('');
    const message = 'Setting up doxity project with npm install. This may take a while...';
    const spinner = setInterval(() => {
      i++;
      if (i >= seq.length) { i = 0; }
      process.stdout.write(`\r${seq[i]} ${message}`);
    }, 1000 / 24);
    // install the deps
    const npmCommand = isWindows() ? "npm.cmd" : "npm";
    const npmInstall = childProcess.spawn(npmCommand, ['install'], { cwd: absoluteTarget });

    npmInstall.stdout.removeAllListeners('data');
    npmInstall.stderr.removeAllListeners('data');
    npmInstall.stdout.pipe(process.stdout);
    npmInstall.stderr.pipe(process.stderr);
    npmInstall.on('close', () => {
      clearInterval(spinner);
      const doxityrcFile = path.join(process.env.PWD, DOXITYRC_FILE);
      // overwrite doxityrc file
      if (fs.existsSync(doxityrcFile)) { fs.unlinkSync(doxityrcFile); }
      fs.writeFileSync(doxityrcFile, `${JSON.stringify(args, null, 2)}\n`);

      process.stdout.write('Doxity is initialized! Now run `doxity build`\n');
      process.exit();
    });
  });
}
