// @flow

import BabelTypes, {
  ObjectExpression
} from 'babel-types';

type InputObjectType = {
  [key: string]: string | InputObjectType
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
    } else {
      throw new Error('Unexpected type.');
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
