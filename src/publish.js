import fs from 'fs';
import childProcess from 'child_process';

import { clearDirectory } from './helpers';

export default function ({ target, out }) {
  // TODO check folder exists...
  const cwd = `${process.env.PWD}/${target}`;
  const outputFolder = `${cwd}/public`;
  const destFolder = `${process.env.PWD}/${out}`;
  clearDirectory(destFolder).then(() => {
    const runDev = childProcess.spawn('npm', ['run', 'build'], { cwd });
    runDev.stdout.pipe(process.stdout);
    runDev.stderr.pipe(process.stderr);
    runDev.on('close', () => {
      fs.renameSync(outputFolder, destFolder);
      process.stdout.write(`Published Documentation to ${destFolder}\n`);
      process.exit();
    });
  });
}
