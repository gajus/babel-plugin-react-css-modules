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
export default (
  path: *,
  styleModuleImportMap: StyleModuleImportMapType,
  sourceAttribute: JSXAttribute,
  destinationName: string,
  options: OptionsType): void => {
  const resolvedStyleName = getClassName(sourceAttribute.value.value, styleModuleImportMap, options);

  const destinationAttribute = path.node.openingElement.attributes
    .find((attribute) => {
      return typeof attribute.name !== 'undefined' && attribute.name.name === destinationName;
    });

  if (destinationAttribute) {
    if (isStringLiteral(destinationAttribute.value)) {
      destinationAttribute.value.value += ' ' + resolvedStyleName;
    } else if (isJSXExpressionContainer(destinationAttribute.value)) {
      destinationAttribute.value.expression = conditionalClassMerge(
        destinationAttribute.value.expression,
        stringLiteral(resolvedStyleName)
      );
    } else {
      throw new Error('Unexpected attribute value:' + destinationAttribute.value);
    }

    path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(sourceAttribute), 1);
  } else {
    sourceAttribute.name.name = destinationName;
    sourceAttribute.value.value = resolvedStyleName;
  }
};
