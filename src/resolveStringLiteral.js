// @flow

import {
  isJSXExpressionContainer,
  isStringLiteral,
  JSXAttribute,
  stringLiteral
} from 'babel-types';
import conditionalClassMerge from './conditionalClassMerge';
import getClassName from './getClassName';
import type {
  StyleModuleImportMapType
} from './types';

/**
 * Updates the className value of a JSX element using a provided styleName attribute.
 */
export default (path: Object, styleModuleImportMap: StyleModuleImportMapType, styleAttribute: JSXAttribute): void => {
  const resolvedStyleName = getClassName(styleAttribute.value.value, styleModuleImportMap);

  if (styleAttribute.name.name === 'styleId') {
    styleAttribute.name.name = 'id';
    styleAttribute.value.value = resolvedStyleName;

    return;
  }

  const classNameAttribute = path.node.openingElement.attributes
    .find((attribute) => {
      return typeof attribute.name !== 'undefined' && attribute.name.name === 'className';
    });

  if (classNameAttribute) {
    if (isStringLiteral(classNameAttribute.value)) {
      classNameAttribute.value.value += ' ' + resolvedStyleName;
    } else if (isJSXExpressionContainer(classNameAttribute.value)) {
      classNameAttribute.value.expression = conditionalClassMerge(
        classNameAttribute.value.expression,
        stringLiteral(resolvedStyleName)
      );
    } else {
      throw new Error('Unexpected attribute value.');
    }

    path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(styleAttribute), 1);
  } else {
    styleAttribute.name.name = 'className';
    styleAttribute.value.value = resolvedStyleName;
  }
};
