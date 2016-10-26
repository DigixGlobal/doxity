import childProcess from 'child_process';

import { DEFAULT_TARGET } from './constants';

export default function ({ target = DEFAULT_TARGET } = {}) {
  // TODO check we're in ther right folder.. ?
  const runDev = childProcess.spawn('npm', ['run', 'develop'], { cwd: `${process.env.PWD}/${target}` });
  runDev.stdout.pipe(process.stdout);
  runDev.stderr.pipe(process.stderr);
  runDev.on('close', () => process.exit());
}
