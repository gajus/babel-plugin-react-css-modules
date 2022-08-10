// @flow

import {
  booleanLiteral,
  isAnyTypeAnnotation,
  ObjectExpression,
  objectExpression,
  objectProperty,
  stringLiteral
} from '@babel/types';

type InputObjectType = {
  [key: string]: *
};

/**
 * Creates an AST representation of an InputObjectType shape object.
 */
const createObjectExpression = (object: InputObjectType): ObjectExpression => {
  const properties = [];

  for (const name of Object.keys(object)) {
    const value = object[name];

    let newValue;

    // eslint-disable-next-line no-empty
    if (isAnyTypeAnnotation(value)) {

    } else if (typeof value === 'string') {
      newValue = stringLiteral(value);
    } else if (typeof value === 'object') {
      newValue = createObjectExpression(value);
    } else if (typeof value === 'boolean') {
      newValue = booleanLiteral(value);
    } else if (typeof value === 'undefined') {
      // eslint-disable-next-line no-continue
      continue;
    } else {
      throw new TypeError('Unexpected type: ' + typeof value);
    }

    properties.push(
      objectProperty(
        stringLiteral(name),
        newValue
      )
    );
  }

  return objectExpression(properties);
};

export default createObjectExpression;
