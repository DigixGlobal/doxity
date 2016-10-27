import fs from 'fs';
import childProcess from 'child_process';
import glob from 'glob';
import toml from 'toml';
import tomlify from 'tomlify-j0.4';

import { CONFIG_FILE, README_FILE, README_TARGET } from './constants';

function getDocs(name, doc) {
  // TODO add docs anyway if they are not found... ? E.G. for methods
  return doc.methods[Object.keys(doc.methods).find(signature => name === signature.split('(')[0])];
}

export default function ({ target, src, dir, whitelist }) {
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
  // for each contract create a json file in the target directory
  process.stdout.write(`Generating code for ${sources.length} contracts...`);
  // do we need to check for whitelist?
  let defaultWhitelist = { source: true, bytecode: true, abi: true, methods: true };
  if (whitelist && Object.keys(whitelist).length > 0) {
    defaultWhitelist = whitelist.all || {};
  }
  Object.keys(contracts).forEach((contractName) => {
    // determine whether we should be skipped
    const myWhitelist = { ...defaultWhitelist, ...(whitelist || {})[contractName] };
    // get the source file
    const sourceFile = sources.find((fileName) => {
      const split = fileName.split('/');
      return `${contractName}.sol` === split[split.length - 1];
    });
    // ensure the contract exists
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
        name: contractName,
        fileName: sourceFile.replace(process.env.PWD, ''),
        // only pass these if they are whitelisted
        abi: myWhitelist.abi && abi,
        bin: myWhitelist.bytecode && bin,
        opcodes: myWhitelist.bytecode && opcodes,
        source: myWhitelist.source && fs.readFileSync(sourceFile).toString(),
        abiDocs: myWhitelist.methods && abi.map((methodAbi) => {
          // get find relevent docs
          const devDocs = getDocs(methodAbi.name, contractDevDoc) || {};
          const userDocs = getDocs(methodAbi.name, contractUserDoc) || {};
          // map abi inputs to devdoc inputs
          const params = devDocs.params || {};
          const inputs = methodAbi.inputs.map(param => ({ ...param, description: params[param.name] }));
          // don't write this
          delete devDocs.params;

          // START HACK workaround pending https://github.com/ethereum/solidity/issues/1277
          // TODO map outputs properly once compiler splits them out
          // in the meantime, use json array
          // parse devDocs.return as a json object
          let outputs;
          try {
            const outputParams = JSON.parse(devDocs.return);
            outputs = methodAbi.outputs.map(param => ({ ...param, description: outputParams[param.name] }));
          } catch (e) {
            outputs = methodAbi.outputs;
          }
          // END HACK

          return {
            ...devDocs,
            ...userDocs,
            ...methodAbi,
            inputs,
            outputs,
          };
        }),
      };
      delete data.methods;
      fs.writeFileSync(`${output}/${contractName}.json`, `${JSON.stringify(data)}\n`);
    }
  });

  const configFile = `${process.env.PWD}/${target}/${CONFIG_FILE}`;
  // todo inherit from .doxityrc
  let config = {
    compiler: compiler.version,
    name: pkgConfig.name,
    license: pkgConfig.license,
    version: pkgConfig.version,
    description: pkgConfig.description,
    homepage: pkgConfig.homepage,
    author: pkgConfig.author,
    buildTime: new Date(),
  };
  try { // try marginging with old config
    config = { ...toml.parse(fs.readFileSync(`${process.env.PWD}/${target}/${CONFIG_FILE}`).toString()), ...config };
  } catch (e) {
    /* do nothing */
    console.log('Error copying config', e);
  }
  // write the config
  if (fs.existsSync(configFile)) { fs.unlinkSync(configFile); }
  fs.writeFileSync(configFile, `${tomlify(config)}`);

  // copy the readme
  try {
    const readmeFile = glob.sync(`${process.env.PWD}/${README_FILE}`, { nocase: true })[0];
    const readmeTarget = `${process.env.PWD}/${target}/${README_TARGET}`;
    if (fs.existsSync(readmeTarget)) { fs.unlinkSync(readmeTarget); }
    fs.writeFileSync(readmeTarget, fs.readFileSync(readmeFile));
  } catch (e) {
    /* do nothing */
    console.log('Error copying readme file', e);
  }

  process.stdout.write('\rDocumentation data is created! Now use `doxity publish` or `doxity develop`\n');
}
