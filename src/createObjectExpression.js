// @flow

import BabelTypes, {
  ObjectExpression
} from 'babel-types';

type InputObjectType = {
  [key: string]: *
};

/**
 * Creates an AST representation of an InputObjectType shape object.
 */
const createObjectExpression = (t: BabelTypes, object: InputObjectType): ObjectExpression => {
  const properties = [];

  for (const name of Object.keys(object)) {
    const value = object[name];

    let newValue;

    // eslint-disable-next-line no-empty
    if (t.isAnyTypeAnnotation(value)) {

    } else if (typeof value === 'string') {
      newValue = t.stringLiteral(value);
    } else if (typeof value === 'object') {
      newValue = createObjectExpression(t, value);
    } else if (typeof value === 'boolean') {
      newValue = t.booleanLiteral(value);
    } else {
      throw new TypeError('Unexpected type: ' + typeof value);
    }

    properties.push(
      t.objectProperty(
        t.stringLiteral(name),
        newValue
      )
    );
  }

  return t.objectExpression(properties);
};

export default createObjectExpression;
