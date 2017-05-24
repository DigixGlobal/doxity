import fs from 'fs';
import childProcess from 'child_process';

import { clearDirectory, getNpmCommandName } from './helpers';

export default function ({ target, out }) {
  // TODO check folder exists...
  const cwd = `${process.cwd()}/${target}`;
  const outputFolder = `${cwd}/public`;
  const destFolder = `${process.cwd()}/${out}`;
  clearDirectory(destFolder).then(() => {
    const runDev = childProcess.spawn(getNpmCommandName(), ['run', 'build'], { cwd });
    runDev.stdout.pipe(process.stdout);
    runDev.stderr.pipe(process.stderr);
    runDev.on('close', () => {
      fs.renameSync(outputFolder, destFolder);
      process.stdout.write(`Published Documentation to ${destFolder}\n`);
      process.exit();
    });
  });
}
