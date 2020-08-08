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
  types: BabelTypes,
  object: InputObjectType,
): ObjectExpression => {
  const properties = [];

  for (const name of Object.keys(object)) {
    const value = object[name];

    let newValue;

    // eslint-disable-next-line no-empty
    if (types.isAnyTypeAnnotation(value)) {

    } else if (typeof value === 'string') {
      newValue = types.stringLiteral(value);
    } else if (typeof value === 'object') {
      newValue = createObjectExpression(types, value);
    } else if (typeof value === 'boolean') {
      newValue = types.booleanLiteral(value);
    } else if (typeof value === 'undefined') {
      // eslint-disable-next-line no-continue
      continue;
    } else {
      throw new TypeError('Unexpected type: ' + typeof value);
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
