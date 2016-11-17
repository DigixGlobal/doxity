/* eslint-disable global-require */

import fs from 'fs';
import childProcess from 'child_process';
import glob from 'glob';
import toml from 'toml';
import tomlify from 'tomlify-j0.4';

import { CONFIG_FILE, README_FILE, README_TARGET, DOXITYRC_FILE } from '../constants';

import parseAbi from './parse-abi';

export default function ({ target, src, dir, whitelist, interaction }) {
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
  process.stdout.write(`${exec}\n`);
  const { sources, contracts, version } = JSON.parse(childProcess.execSync(exec));
  // for each contract create a json file in the target directory
  // do we need to check for whitelist?
  let defaultWhitelist = { source: true, bytecode: true, abi: true, methods: true };
  if (whitelist && Object.keys(whitelist).length > 0) {
    defaultWhitelist = whitelist.all || {};
  }
  process.stdout.write(`Generating output for ${Object.keys(sources).length} files...\n`);
  Object.keys(contracts).forEach((contractName) => {
    // determine whether we should be skipped
    const myWhitelist = { ...defaultWhitelist, ...(whitelist || {})[contractName] };
    // get the source file
    const fileName = Object.keys(sources).find((name) => {
      const contractDefinition = sources[name].AST.children.find(c => c.name === 'ContractDefinition');
      return contractDefinition.attributes.name === contractName;
    });
    if (!fileName) {
      process.stdout.write(`Could not find source code for: ${contractName}, skipping\n`);
      return null;
    }
    // get deploy info from truffle
    let address;
    if (interaction) {
      try {
        const instance = require(`${process.env.PWD}/build/contracts/${contractName}.sol.js`);
        address = instance.all_networks[interaction.network].address;
      } catch (e) { /* do noithing */ }
    }
    const contract = contracts[contractName];
    const { bin, opcodes, abi, devdoc } = contract;
    const { author, title } = JSON.parse(devdoc);
    const data = {
      author,
      title,
      fileName,
      address,
      name: contractName,
      // only pass these if they are whitelisted
      abi: myWhitelist.abi && JSON.parse(abi),
      bin: myWhitelist.bytecode && bin,
      opcodes: myWhitelist.bytecode && opcodes,
      source: myWhitelist.source && fs.readFileSync(`${process.env.PWD}/${fileName}`).toString(),
      abiDocs: myWhitelist.methods && parseAbi(contract),
    };
    delete data.methods;
    return fs.writeFileSync(`${output}/${contractName}.json`, `${JSON.stringify(data)}\n`);
  });

  let config = {
    compiler: version,
    name: pkgConfig.name,
    license: pkgConfig.license,
    version: pkgConfig.version,
    description: pkgConfig.description,
    homepage: pkgConfig.homepage,
    author: pkgConfig.author.name || pkgConfig.author,
    buildTime: new Date(),
  };

  const configFile = `${process.env.PWD}/${target}/${CONFIG_FILE}`;

  try { // try marginging with old config
    config = { ...toml.parse(fs.readFileSync(configFile).toString()), ...config };
  } catch (e) {
    /* do nothing */
    console.log('Error copying config', e);
  }

  try { // try marginging with doxity config
    config = { ...config, ...JSON.parse(fs.readFileSync(`${process.env.PWD}/${DOXITYRC_FILE}`).toString()) };
  } catch (e) { /* do nothing */ }

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
  process.stdout.write('  done!\n');
}
