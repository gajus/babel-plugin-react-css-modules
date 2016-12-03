// @flow

import BabelTypes, {
  ObjectExpression
} from 'babel-types';

const createObjectExpression = (t: BabelTypes, object: Object): ObjectExpression => {
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
        t.identifier(name),
        newValue
      )
    );
  }

  return t.objectExpression(properties);
};

export default createObjectExpression;
