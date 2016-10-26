import path from 'path';
import fs from 'fs';
import glob from 'glob';
import childProcess from 'child_process';

import { DEFAULT_SRC_DIR, DEFAULT_TARGET, DEFAULT_PAGES_DIR } from './constants';

function getDocs(name, doc) {
  return doc.methods[Object.keys(doc.methods).find(signature => name === signature.split('(')[0])];
}

export default function ({ target = DEFAULT_TARGET, src = DEFAULT_SRC_DIR, dir = DEFAULT_PAGES_DIR }) {
  // TODO configurable input
  const output = `${process.env.PWD}/${target}/${dir}`;
  if (!fs.existsSync(output)) { throw new Error(`Output directory ${output} not found, are you in the right directory?`); }
  // clear out the output folder (remove all json files)
  glob.sync(`${output}/*.json`).forEach(file => fs.unlinkSync(file));
  // TODO find in a better way?
  const pkgJson = fs.readFileSync(`${process.env.PWD}/package.json`);
  const pkgConfig = pkgJson ? JSON.parse(pkgJson) : {};
  // TODO implement sourcemaps
  // abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc
  const exec = `solc --combined-json abi,bin,devdoc,interface,opcodes,userdoc ${src}/**/*`;
  const { contracts, ...compiler } = JSON.parse(childProcess.execSync(exec));
  // find the source file and save the page data
  const sources = glob.sync(`${process.env.PWD}/${src}/**/*`);
  const message = `Generating code for ${sources.length} contracts...`;
  process.stdout.write(message);
  Object.keys(contracts).forEach((contractName) => {
    const sourceFile = sources.find((fileName) => {
      const split = fileName.split('/');
      return `${contractName}.sol` === split[split.length - 1];
    });
    if (sourceFile) {
      const contract = contracts[contractName];
      const { bin, opcodes } = contract;
      const contractDevDoc = JSON.parse(contract.devdoc);
      const contractUserDoc = JSON.parse(contract.userdoc);
      const { author, title } = JSON.parse(contract.devdoc);
      const abi = JSON.parse(contract.abi);
      const data = {
        author,
        title,
        abi,
        bin,
        opcodes,
        fileName: sourceFile,
        name: contractName,
        source: fs.readFileSync(sourceFile).toString(),
        abiDocs: abi.map((methodAbi) => {
          const devDocs = getDocs(methodAbi.name, contractDevDoc) || {};
          const userDocs = getDocs(methodAbi.name, contractUserDoc) || {};
          // map abi methods to devdoc methods
          if (devDocs.params) {
            methodAbi.inputs = methodAbi.inputs.map((param) => {
              param.description = devDocs.params[param.name];
              return param;
            })
            delete devDocs.params;
            // TODO map outputs once compiler splits them out
            // const userMethods = userDocs.methods;
            // if (userMethods) { delete userMethods.methods; }
          }
          return {
            ...devDocs,
            ...userDocs,
            ...methodAbi,
          }
        }),
      }
      delete data.methods;
      fs.writeFileSync(`${output}/${contractName}.json`, JSON.stringify(data));
    }
  });

  process.stdout.write(`\r${message.split('').fill(' ').join('')}\r`);
  process.stdout.write('Documentation data is created! Now use `doxify publish` or `doxify develop`\n');

  const config = {
    compiler: compiler.version,
    name: pkgConfig.name,
    version: pkgConfig.version,
    description: pkgConfig.description,
    homepage: pkgConfig.homepage,
  };
}
