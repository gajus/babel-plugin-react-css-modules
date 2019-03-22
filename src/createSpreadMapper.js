// @flow

import {
  Expression,
  memberExpression,
  binaryExpression,
  stringLiteral,
  logicalExpression,
  identifier,
  isJSXSpreadAttribute
} from '@babel/types';
import optionsDefaults from './schemas/optionsDefaults';

const createSpreadMapper = (path: *, stats: *): { [destinationName: string]: Expression } => {
  const result = {};

  let {attributeNames} = optionsDefaults;

  if (stats.opts && stats.opts.attributeNames) {
    attributeNames = Object.assign({}, attributeNames, stats.opts.attributeNames);
  }

  const attributes = Object
    .entries(attributeNames)
    .filter((pair) => {
      return pair[1];
    });

  const attributeKeys = attributes.map((pair) => {
    return pair[0];
  });

  const spreadAttributes = path.node.openingElement.attributes
    .filter((attr) => {
      return isJSXSpreadAttribute(attr);
    });

  for (const spread of spreadAttributes) {
    for (const attributeKey of attributeKeys) {
      const destinationName = attributeNames[attributeKey];

      if (result[destinationName]) {
        result[destinationName] = binaryExpression(
          '+',
          result[destinationName],
          binaryExpression(
            '+',
            stringLiteral(' '),
            logicalExpression(
              '||',
              memberExpression(
                spread.argument,
                identifier(destinationName),
              ),
              stringLiteral('')
            )
          ),
        );
      } else {
        result[destinationName] = logicalExpression(
          '||',
          memberExpression(
            spread.argument,
            identifier(destinationName),
          ),
          stringLiteral('')
        );
      }
    }
  }

  return result;
};

export default createSpreadMapper;
