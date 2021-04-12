// @flow

import BabelTypes, {
  ObjectExpression,
} from '@babel/types';

type InputObjectType = {
  [key: string]: *,
  ...
};

/**
 * Creates an AST representation of an InputObjectType shape object.
 */
const createObjectExpression = (
  types: typeof BabelTypes,
  object: InputObjectType,
): typeof ObjectExpression => {
  const properties = [];

  for (const name of Object.keys(object)) {
    const value = object[name];

    let newValue;

    if (!types.isAnyTypeAnnotation(value)) {
      switch (typeof value) {
      case 'string':
        newValue = types.stringLiteral(value);
        break;
      case 'object':
        newValue = createObjectExpression(types, value);
        break;
      case 'boolean':
        newValue = types.booleanLiteral(value);
        break;
      case 'undefined':
        continue;
      default:
        throw new TypeError('Unexpected type: ' + typeof value);
      }
    }

    properties.push(
      types.objectProperty(
        types.stringLiteral(name),
        newValue,
      ),
    );
  }

  return types.objectExpression(properties);
};

export default createObjectExpression;
