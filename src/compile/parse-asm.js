import { getFunctionSignature } from '../helpers';

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

export default function ({ contract, source }) {

  const definitions = {
    PragmaDirective({ attributes }) {
      const [compiler, ...version] = attributes.literals;
      return { pragma: `${compiler} ${version.join('')}` };
    },
    ContractDefinition({ attributes, children }) {
      // console.log(children);
      return {
        ...attributes,
        definitions: children.map(parseDefinition).filter(c => c),
      };
    },
    _definition(args) {
      // console.log('definitoin', args);
      if (args.attributes.name === 'find') {
        // console.log(JSON.stringify(args.children, null, 2));
        // merge inputs and outputs
        let signatureParams = [];
        const [ inputs, outputs ] = args.children.filter(child => child.name === "ParameterList")
        .map(params => params.children.map(param => {
          let { type } = param.attributes;
          if (param.children[0].name === 'UserDefinedTypeName') {
            type = `${contract.name}.${param.attributes.type.split(' ').slice(1, 3).join(' ')}`
          }
          return { ...param.attributes, type };
        }));
        console.log("params", args.attributes.name, inputs, outputs);
      }
      // add devdocs
      return {
        ...args.attributes,
        // signature:
      }
      // return name,
      // signature
    },
    VariableDeclaration(args) {
      return { definition: 'variable', ...this._definition(args) };
    },
    ModifierDefinition(args) {
      return { definition: 'modifier', ...this._definition(args) };
    },
    StructDefinition(args) {
      return { definition: 'struct', ...this._definition(args) };
    },
    FunctionDefinition(args) {
      return { definition: 'function', ...this._definition(args) };
    },
  }

  function parseDefinition(definition) {
    return definitions[definition.name] && definitions[definition.name](definition);
  }
  source.AST.children.map(parseDefinition);
  return [];
}
