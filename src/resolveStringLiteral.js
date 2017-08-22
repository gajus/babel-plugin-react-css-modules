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
  StyleModuleImportMapType,
  HandleMissingStyleNameOptionType
} from './types';

type OptionsType = {|
  handleMissingStyleName: HandleMissingStyleNameOptionType
|};

/**
 * Updates the className value of a JSX element using a provided styleName attribute.
 */
export default (path: *, styleModuleImportMap: StyleModuleImportMapType, styleNameAttribute: JSXAttribute, options: OptionsType): void => {
  const classNameAttribute = path.node.openingElement.attributes
    .find((attribute) => {
      return typeof attribute.name !== 'undefined' && attribute.name.name === 'className';
    });

  const resolvedStyleName = getClassName(styleNameAttribute.value.value, styleModuleImportMap, options);

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

    path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(styleNameAttribute), 1);
  } else {
    styleNameAttribute.name.name = 'className';
    styleNameAttribute.value.value = resolvedStyleName;
  }
};
