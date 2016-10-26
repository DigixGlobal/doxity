import rmdir from 'rimraf';
import mkdirp from 'mkdirp';

export function clearDirectory(target) {
  return new Promise((resolve, reject) => {
    mkdirp(target, () => {
      rmdir(target, (err) => {
        if (err) { return reject(err); }
        return resolve();
      });
    });
  });
}
