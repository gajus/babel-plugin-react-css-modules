// @flow

import {
  binaryExpression,
  isJSXExpressionContainer,
  isStringLiteral,
  JSXAttribute,
  stringLiteral
} from 'babel-types';
import getClassName from './getClassName';
import type {
  StyleModuleImportMapType
} from './types';

/**
 * Updates the className value of a JSX element using a provided styleName attribute.
 */
export default (path: Object, styleModuleImportMap: StyleModuleImportMapType, styleNameAttribute: JSXAttribute): void => {
  const classNameAttribute = path.node.openingElement.attributes
    .find((attribute) => {
      return typeof attribute.name !== 'undefined' && attribute.name.name === 'className';
    });

  const resolvedStyleName = getClassName(styleNameAttribute.value.value, styleModuleImportMap);

  if (classNameAttribute) {
    if (isStringLiteral(classNameAttribute.value)) {
      classNameAttribute.value.value += ' ' + resolvedStyleName;
    } else if (isJSXExpressionContainer(classNameAttribute.value)) {
      classNameAttribute.value.expression = binaryExpression(
        '+',
        classNameAttribute.value.expression,
        stringLiteral(' ' + resolvedStyleName)
      );
    } else {
      throw new Error('Unexpected attribute value.');
    }

    path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(styleNameAttribute), 1);
  } else {
    styleNameAttribute.name.name = 'className';
    styleNameAttribute.value.value = resolvedStyleName;
  }
};
