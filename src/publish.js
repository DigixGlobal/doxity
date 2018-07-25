import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';

import { clearDirectory } from './helpers';

export default function ({ target, out }) {
  function isWindows() {
      return process.platform === "win32";
  };

  // TODO check folder exists...
  const cwd = path.join(process.env.PWD, target);
  const outputFolder = path.join(cwd, '/public');
  const destFolder = path.join(process.env.PWD, out);
  clearDirectory(destFolder).then(() => {
    var npmCommand = isWindows() ? "npm.cmd" : "npm";
    var runDev = childProcess.spawn(npmCommand, ['run', 'build'], { cwd: cwd });
    runDev.stdout.pipe(process.stdout);
    runDev.stderr.pipe(process.stderr);
    runDev.on('close', () => {
      fs.renameSync(outputFolder, destFolder);
      process.stdout.write(`Published Documentation to ${destFolder}\n`);
      process.exit();
    });
  });
}
