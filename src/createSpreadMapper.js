// @flow

import {
  Expression,
  memberExpression,
  binaryExpression,
  stringLiteral,
  identifier,
  callExpression,
  arrayExpression
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

  // To be used during spread cleanup
  const spreadExcludeKeys = attributes.reduce((excludes, pair) => {
    return excludes.concat(pair);
  }, []);

  path.traverse({
    JSXSpreadAttribute (spreadPath: *) {
      const spread = spreadPath.node;

      for (const attributeKey of attributeKeys) {
        const destinationName = attributeNames[attributeKey];

        if (result[destinationName]) {
          result[destinationName] = binaryExpression(
            '+',
            result[destinationName],
            binaryExpression(
              '+',
              stringLiteral(' '),
              memberExpression(
                spread.argument,
                identifier(destinationName),
              ),
            ),
          );
        } else {
          result[destinationName] = memberExpression(
            spread.argument,
            identifier(destinationName),
          );
        }
      }

      // Cleanup spreaded properties to prevent possibility
      // of replacing the final/actual className
      spread.argument = callExpression(
        stats.addHelper('objectWithoutProperties'),
        [spread.argument, arrayExpression(spreadExcludeKeys.map((key) => {
          return stringLiteral(key);
        }))]
      );
    }
  });

  return result;
};

export default createSpreadMapper;
