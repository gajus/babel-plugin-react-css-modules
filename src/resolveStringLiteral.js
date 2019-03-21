// @flow

import {
  isJSXExpressionContainer,
  isStringLiteral,
  JSXAttribute,
  jSXExpressionContainer,
  binaryExpression,
  stringLiteral,
  Expression
} from '@babel/types';
import conditionalClassMerge from './conditionalClassMerge';
import getClassName from './getClassName';
import type {
  StyleModuleImportMapType,
  GetClassNameOptionsType
} from './types';

/**
 * Updates the className value of a JSX element using a provided styleName attribute.
 */
export default (
  path: *,
  styleModuleImportMap: StyleModuleImportMapType,
  sourceAttribute: JSXAttribute,
  destinationName: string,
  options: GetClassNameOptionsType,
  fromSpread?: Expression
): void => {
  const resolvedStyleName = getClassName(sourceAttribute.value.value, styleModuleImportMap, options);

  const destinationAttribute = path.node.openingElement.attributes
    .find((attribute) => {
      return typeof attribute.name !== 'undefined' && attribute.name.name === destinationName;
    });

  if (destinationAttribute) {
    if (isStringLiteral(destinationAttribute.value)) {
      destinationAttribute.value.value += ' ' + resolvedStyleName;
      if (fromSpread) {
        destinationAttribute.value = jSXExpressionContainer(
          binaryExpression(
            '+',
            destinationAttribute.value,
            binaryExpression(
              '+',
              stringLiteral(' '),
              fromSpread
            )
          )
        );
      }
    } else if (isJSXExpressionContainer(destinationAttribute.value)) {
      destinationAttribute.value.expression = conditionalClassMerge(
        destinationAttribute.value.expression,
        stringLiteral(resolvedStyleName)
      );
      if (fromSpread) {
        destinationAttribute.value = jSXExpressionContainer(
          binaryExpression(
            '+',
            destinationAttribute.value.expression,
            binaryExpression(
              '+',
              stringLiteral(' '),
              fromSpread
            )
          )
        );
      }
    } else {
      throw new Error('Unexpected attribute value:' + destinationAttribute.value);
    }

    path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(sourceAttribute), 1);
  } else {
    sourceAttribute.name.name = destinationName;
    sourceAttribute.value.value = resolvedStyleName;

    if (fromSpread) {
      sourceAttribute.value = jSXExpressionContainer(
        binaryExpression(
          '+',
          sourceAttribute.value,
          binaryExpression(
            '+',
            stringLiteral(' '),
            fromSpread
          )
        )
      );
    }
  }
};
