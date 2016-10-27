'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (contract) {
  return JSON.parse(contract.abi).map(function (method) {
    // get find relevent docs
    var signature = (method.name || '') + '(' + method.inputs.map(function (i) {
      return i.type;
    }).join(',') + ')';
    var signatureHash = new _keccakjs2.default(256).update(signature).digest('hex').substr(0, 8);
    var devDocs = ((JSON.parse(contract.devdoc) || {}).methods || {})[signature] || {};
    var userDocs = ((JSON.parse(contract.userdoc) || {}).methods || {})[signature] || {};
    // map abi inputs to devdoc inputs
    var params = devDocs.params || {};
    var inputs = method.inputs.map(function (param) {
      return _extends({}, param, { description: params[param.name] });
    });
    // don't write this
    delete devDocs.params;

    // START HACK workaround pending https://github.com/ethereum/solidity/issues/1277
    // TODO map outputs properly once compiler splits them out
    // in the meantime, use json array
    // parse devDocs.return as a json object
    var outputs = void 0;
    try {
      (function () {
        var outputParams = JSON.parse(devDocs.return);
        outputs = method.outputs.map(function (param) {
          return _extends({}, param, { description: outputParams[param.name] });
        });
      })();
    } catch (e) {
      outputs = method.outputs;
    }
    // END HACK

    return _extends({}, method, devDocs, userDocs, {
      signature: signature,
      signatureHash: signatureHash,
      inputs: inputs,
      outputs: outputs
    });
  });
};

var _keccakjs = require('keccakjs');

var _keccakjs2 = _interopRequireDefault(_keccakjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }