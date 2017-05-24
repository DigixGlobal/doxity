import fs from 'fs';
import childProcess from 'child_process';
import Config from 'truffle-config';
import Resolver from 'truffle-resolver';
import compile from 'truffle-compile';

export default function (src) {
  // detect if we're in a truffle project
  return new Promise((resolve) => {
    if (fs.existsSync(`${process.cwd()}/truffle.js`)) {
      const config = Config.default();
      config.resolver = new Resolver(config);
      config.rawData = true;
      compile.all(config, (err, res) => {
        if (err) { throw err; }
        resolve({
          contracts: Object.keys(res).reduce((o, k) => {
            const { metadata, ...rest } = res[k].rawData;
            const { output, settings } = JSON.parse(metadata);
            const fN = Object.keys(settings.compilationTarget)[0];
            const fileName = fN.indexOf(process.cwd()) === 0 ? fN : `${process.cwd()}/node_modules/${fN}`;
            return {
              ...o,
              [k]: { ...rest, ...output, fileName },
            };
          }, {}),
        });
      });
    } else {
      const exec = `solc --combined-json abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc ${src}`;
      const res = JSON.parse(childProcess.execSync(exec));
      resolve({
        contracts: Object.keys(res.contracts).reduce((o, k) => {
          const file = k.split(':')[0];
          const fileFragments = file.split('/');
          const contractName = fileFragments[fileFragments.length - 1].split('.sol')[0];
          const contract = res.contracts[k];
          const fileName = `${process.cwd()}/${k.split(':')[0]}`;
          return {
            ...o,
            [contractName]: {
              ...contract,
              fileName,
              abi: JSON.parse(contract.abi),
              devdoc: JSON.parse(contract.devdoc),
              userdoc: JSON.parse(contract.userdoc),
            },
          };
        }, {}),
      });
    }
  });
}
