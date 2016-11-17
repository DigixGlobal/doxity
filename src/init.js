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
  const absoluteTarget = `${process.env.PWD}/${target}`;
  const tmpTarget = path.resolve(`${process.env.PWD}/${target}/../doxity-tmp-${new Date()}`);
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
    fs.renameSync(`${tmpTarget}/${fs.readdirSync(tmpTarget)[0]}`, absoluteTarget);
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
    const npmInstall = childProcess.spawn('npm', ['install'], { cwd: absoluteTarget });
    npmInstall.stdout.removeAllListeners('data');
    npmInstall.stderr.removeAllListeners('data');
    npmInstall.stdout.pipe(process.stdout);
    npmInstall.stderr.pipe(process.stderr);
    npmInstall.on('close', () => {
      clearInterval(spinner);
      const doxityrcFile = `${process.env.PWD}/${DOXITYRC_FILE}`;
      // overwrite doxityrc file
      if (fs.existsSync(doxityrcFile)) { fs.unlinkSync(doxityrcFile); }
      fs.writeFileSync(doxityrcFile, `${JSON.stringify(args, null, 2)}\n`);

      process.stdout.write('Doxity is initialized! Now run `doxity build`\n');
      process.exit();
    });
  });
}
