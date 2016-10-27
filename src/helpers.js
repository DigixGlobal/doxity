import rmdir from 'rimraf';
import mkdirp from 'mkdirp';
import Keccak from 'keccakjs';

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

export function getFunctionSignature(signature) {
  return new Keccak(256).update(signature).digest('hex').substr(0, 8);
}
