// @flow

import {
  Expression,
  isStringLiteral,
  isJSXExpressionContainer,
  jsxExpressionContainer,
  binaryExpression,
  stringLiteral
} from '@babel/types';

const handleSpreadClassName = (
  path: *,
  destinationName: string,
  classNamesFromSpread: Expression
) => {
  const destinationAttribute = path.node.openingElement.attributes
    .find((attribute) => {
      return typeof attribute.name !== 'undefined' && attribute.name.name === destinationName;
    });

  if (!destinationAttribute) {
    return;
  }

  if (isStringLiteral(destinationAttribute.value)) {
    destinationAttribute.value = jsxExpressionContainer(
      binaryExpression(
        '+',
        destinationAttribute.value,
        binaryExpression(
          '+',
          stringLiteral(' '),
          classNamesFromSpread,
        )
      )
    );
  } else if (isJSXExpressionContainer(destinationAttribute.value)) {
    destinationAttribute.value = jsxExpressionContainer(
      binaryExpression(
        '+',
        destinationAttribute.value.expression,
        binaryExpression(
          '+',
          stringLiteral(' '),
          classNamesFromSpread
        )
      )
    );
  }
};

export default handleSpreadClassName;
