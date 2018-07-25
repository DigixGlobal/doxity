import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';
import Config from 'truffle-config';
import Resolver from 'truffle-resolver';
import compile from 'truffle-compile';

export default function (src) {
  function expandPath(src) {
    if (!pathEndsWithWildcard(src)) {
     return src;
    }

    const basePath = removeLastCharacter(src);
    const files = traverseDir(basePath, []);
    return files.join(" ");
  };

  function pathEndsWithWildcard(path) {
    return path[path.length - 1] === "*";
  };

  function removeLastCharacter(text) {
    return text.substring(0, text.length - 1);
  };

  function traverseDir(dir, files) {
    files = files || [];
    const dirContents = fs.readdirSync(dir);
    dirContents.forEach(function(dirEntry) {
       const fileName = path.join(dir, dirEntry);
       if (fs.statSync(fileName).isDirectory()) {
           files = traverseDir(fileName, files);
       }
       else {
           files.push(fileName);
       }
    });
    return files;
  };

  function extractFilenameFromContract(contractKey){
    const separatorPosition = contractKey.lastIndexOf(":");
    return contractKey.substring(0, separatorPosition);
  };

  function extractNameFromContract(contractKey) {
    const separatorPosition = contractKey.lastIndexOf(":");
    return contractKey.substring(separatorPosition + 1);
  };

  // detect if we're in a truffle project
  return new Promise((resolve) => {
    if (fs.existsSync(`${process.env.PWD}/truffle.js`)) {
      const config = Config.default();
      config.resolver = new Resolver(config);
      config.rawData = true;
      compile.all(config, (err, res) => {
        if (err) { throw err; }
        resolve({
          contracts: Object.keys(res).reduce((o, k) => {
            const { metadata, ...data } = res[k].rawData;
            try {
              const parsed = JSON.parse(metadata);
              const fN = Object.keys(parsed.settings.compilationTarget)[0];
              data.fileName = fN.indexOf(process.env.PWD) === 0 ? fN : `${process.env.PWD}/node_modules/${fN}`;
              data.output = parsed.output;
            } catch (e) {
              console.log(`⚠️ Error parsing Contract: ${k}`);
            }
            return {
              ...o,
              [k]: data,
            };
          }, {}),
        });
      });
    } else {
      const exec = `solc --combined-json abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc ${expandPath(src)}`;
      const res = JSON.parse(childProcess.execSync(exec));
      resolve({
        contracts: Object.keys(res.contracts).reduce((o, k) => {
          const contract = res.contracts[k];
          let fileName = extractFilenameFromContract(k);
          const contractName = extractNameFromContract(k);

          if (!path.isAbsolute(fileName)) {
            fileName = path.join(process.env.PWD, fileName);
          }

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
