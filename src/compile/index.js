/* eslint-disable global-require */

import fs from 'fs';
import glob from 'glob';
import toml from 'toml';
import tomlify from 'tomlify-j0.4';

import { CONFIG_FILE, README_FILE, README_TARGET, DOXITYRC_FILE } from '../constants';

import solc from './solc';
import parseAbi from './parse-abi';

function compile({ whitelist, contracts, output, target, version }) {
  // do we need to check for whitelist?
  const defaultWhitelist = { source: true, bytecode: true, abi: true, methods: true };
  // if (whitelist && Object.keys(whitelist).length > 0) {
  //   defaultWhitelist = whitelist.all || {};
  // }
  process.stdout.write(`Generating output for ${Object.keys(contracts).length} contracts...\n`);
  Object.keys(contracts).forEach((contractName) => {
    const contract = contracts[contractName];
    // determine whether we should be skipped
    if (whitelist && !whitelist[contractName]) { return null; }
    // otherwise, pick up the defaultss
    const myWhitelist = { ...defaultWhitelist, ...(whitelist || {})[contractName] };
    // get the source file
    const { fileName } = contract;
    if (!fileName) { return null; } // there was an error parsing...
    // TODO fix me
    // const interaction = {};
    // get deploy info from truffle
    // let address;
    // if (interaction) {
    //   try {
    //     const instance = require(`${process.env.PWD}/build/contracts/${contractName}.sol.js`);
    //     address = instance.all_networks[interaction.network].address;
    //   } catch (e) { /* do noithing */ }
    // }
    const { bin, opcodes, abi, devdoc } = contract;
    const { author, title } = devdoc;
    const data = {
      author,
      title,
      fileName: fileName.replace(process.env.PWD, ''),
      // address,
      name: contractName,
      // only pass these if they are whitelisted
      abi: myWhitelist.abi && abi,
      bin: myWhitelist.bytecode && bin,
      opcodes: myWhitelist.bytecode && opcodes,
      source: myWhitelist.source && fs.readFileSync(fileName).toString(),
      abiDocs: myWhitelist.methods && parseAbi(contract),
    };
    return fs.writeFileSync(`${output}/${contractName}.json`, `${JSON.stringify(data)}\n`);
  });

  // TODO find in a better way?
  let pkgConfig = {};
  try {
    pkgConfig = JSON.parse(fs.readFileSync(`${process.env.PWD}/package.json`));
  } catch (e) {
    // console.log('package.json not found, add one for more output');
  }

  let config = {
    compiler: version,
    name: pkgConfig.name,
    license: pkgConfig.license,
    version: pkgConfig.version,
    description: pkgConfig.description,
    homepage: pkgConfig.homepage,
    interaction: {}, // TODO implement
    author: (pkgConfig.author && pkgConfig.author.name) || pkgConfig.author,
    buildTime: new Date(),
  };

  const configFile = `${process.env.PWD}/${target}/${CONFIG_FILE}`;

  try { // try marginging with old config
    config = { ...toml.parse(fs.readFileSync(configFile).toString()), ...config };
  } catch (e) {
    /* do nothing */
    // console.log('Error copying config');
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
    // console.log('Readme file not found, ignoring...');
  }
  process.stdout.write('  done!\n');
}

export default function (opts) {
  const output = `${process.env.PWD}/${opts.target}/${opts.dir}`;
  if (!fs.existsSync(output)) { throw new Error(`Output directory ${output} not found, are you in the right directory?`); }
  // clear out the output folder (remove all json files)
  glob.sync(`${output}/*.json`).forEach(file => fs.unlinkSync(file));
  // get the natspec
  return solc(opts.src).then(({ contracts }) => {
    compile({ ...opts, output, contracts });
  });
}
