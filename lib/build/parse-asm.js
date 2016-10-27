'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (_ref) {
  var contract = _ref.contract,
      source = _ref.source;


  var definitions = {
    PragmaDirective: function PragmaDirective(_ref2) {
      var attributes = _ref2.attributes;

      var _attributes$literals = _toArray(attributes.literals),
          compiler = _attributes$literals[0],
          version = _attributes$literals.slice(1);

      return { pragma: compiler + ' ' + version.join('') };
    },
    ContractDefinition: function ContractDefinition(_ref3) {
      var attributes = _ref3.attributes,
          children = _ref3.children;

      // console.log(children);
      return _extends({}, attributes, {
        definitions: children.map(parseDefinition).filter(function (c) {
          return c;
        })
      });
    },
    _definition: function _definition(args) {
      // console.log('definitoin', args);
      if (args.attributes.name === 'find') {
        // console.log(JSON.stringify(args.children, null, 2));
        // merge inputs and outputs
        var signatureParams = [];

        var _args$children$filter = args.children.filter(function (child) {
          return child.name === "ParameterList";
        }).map(function (params) {
          return params.children.map(function (param) {
            var type = param.attributes.type;

            if (param.children[0].name === 'UserDefinedTypeName') {
              type = contract.name + '.' + param.attributes.type.split(' ').slice(1, 3).join(' ');
            }
            return _extends({}, param.attributes, { type: type });
          });
        }),
            _args$children$filter2 = _slicedToArray(_args$children$filter, 2),
            inputs = _args$children$filter2[0],
            outputs = _args$children$filter2[1];

        console.log("params", args.attributes.name, inputs, outputs);
      }
      // add devdocs
      return _extends({}, args.attributes);
    },
    VariableDeclaration: function VariableDeclaration(args) {
      return _extends({ definition: 'variable' }, this._definition(args));
    },
    ModifierDefinition: function ModifierDefinition(args) {
      return _extends({ definition: 'modifier' }, this._definition(args));
    },
    StructDefinition: function StructDefinition(args) {
      return _extends({ definition: 'struct' }, this._definition(args));
    },
    FunctionDefinition: function FunctionDefinition(args) {
      return _extends({ definition: 'function' }, this._definition(args));
    }
  };

  function parseDefinition(definition) {
    return definitions[definition.name] && definitions[definition.name](definition);
  }
  source.AST.children.map(parseDefinition);
  return [];
};

var _helpers = require('../helpers');

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

/*
WORK IN PROGRESS

we want to end up with a structure like:

{
  name: ContractResolver,
  pragma: '0.4.2',
  imports: [
    {
      name: ContractResolver,
      path: '../aux/blah',
    }
  ],
  docs: [

  ]
  :
}
*/