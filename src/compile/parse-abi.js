import { getFunctionSignature } from '../helpers';

export default function (contract) {
  return JSON.parse(contract.abi).map((method) => {
    // get find relevent docs
    const signature = method.name && `${method.name}(${method.inputs.map(i => i.type).join(',')})`;
    const devDocs = ((JSON.parse(contract.devdoc) || {}).methods || {})[signature] || {};
    const userDocs = ((JSON.parse(contract.userdoc) || {}).methods || {})[signature] || {};
    // map abi inputs to devdoc inputs
    const params = devDocs.params || {};
    const inputs = method.inputs.map(param => ({ ...param, description: params[param.name] }));
    // don't write this
    delete devDocs.params;

    // START HACK workaround pending https://github.com/ethereum/solidity/issues/1277
    // TODO map outputs properly once compiler splits them out
    // in the meantime, use json array
    // parse devDocs.return as a json object
    let outputs;
    try {
      const outputParams = JSON.parse(devDocs.return);
      outputs = method.outputs.map(param => ({ ...param, description: outputParams[param.name] }));
    } catch (e) {
      outputs = method.outputs;
    }
    // END HACK

    return {
      ...method,
      ...devDocs,
      ...userDocs,
      inputs,
      outputs,
      signature,
      signatureHash: signature && getFunctionSignature(signature),
    };
  });
}
