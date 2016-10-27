import fs from 'fs';
import childProcess from 'child_process';
import glob from 'glob';
import toml from 'toml';
import tomlify from 'tomlify-j0.4';

import { CONFIG_FILE, README_FILE, README_TARGET } from '../constants';

import parseAbi from './parse-abi';

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
  const exec = `solc --combined-json abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc ${src}`;
  const { sourceList, sources, contracts, version } = JSON.parse(childProcess.execSync(exec));
  // for each contract create a json file in the target directory
  process.stdout.write(`Generating output for ${sourceList.length} files...`);
  // do we need to check for whitelist?
  let defaultWhitelist = { source: true, bytecode: true, abi: true, methods: true };
  if (whitelist && Object.keys(whitelist).length > 0) {
    defaultWhitelist = whitelist.all || {};
  }
  Object.keys(contracts).forEach((contractName) => {
    // determine whether we should be skipped
    const myWhitelist = { ...defaultWhitelist, ...(whitelist || {})[contractName] };
    // get the source file
    const sourceFile = sourceList.find((fileName) => {
      const split = fileName.split('/');
      return `${contractName}.sol` === split[split.length - 1];
    });
    const contract = contracts[contractName];
    const { bin, opcodes, abi, devdoc, userdoc } = contract;
    const { author, title } = JSON.parse(devdoc);
    const data = {
      ...devdoc,
      ...userdoc,
      author,
      title,
      name: contractName,
      fileName: sourceFile,
      // only pass these if they are whitelisted
      abi: myWhitelist.abi && JSON.parse(abi),
      bin: myWhitelist.bytecode && bin,
      opcodes: myWhitelist.bytecode && opcodes,
      source: myWhitelist.source && fs.readFileSync(`${process.env.PWD}/${sourceFile}`).toString(),
      abiDocs: myWhitelist.methods && parseAbi(contract),
    };
    delete data.methods;
    fs.writeFileSync(`${output}/${contractName}.json`, `${JSON.stringify(data)}\n`);
  });

  const configFile = `${process.env.PWD}/${target}/${CONFIG_FILE}`;
  // todo inherit from .doxityrc
  let config = {
    compiler: version,
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
