// @flow

import {
  isJSXExpressionContainer,
  isStringLiteral,
  isObjectExpression,
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
  const callExpressionArguments = sourceAttribute.value.expression.arguments;

  for (let argumentIndex in callExpressionArguments) {
      let argument = callExpressionArguments[argumentIndex];
      if(isStringLiteral(argument)) {
        callExpressionArguments[argumentIndex].value = getClassName(argument.value, styleModuleImportMap, options);
      } else if(isObjectExpression(argument)) {
        for (let propertyIndex in argument.properties){
            let property = argument.properties[propertyIndex];
            if(isStringLiteral(property.key)) {
                property.key.value = getClassName(property.key.value, styleModuleImportMap, options);
            }
        }
      }
  }
  

  const destinationAttribute = path.node.openingElement.attributes
    .find((attribute) => {
      return typeof attribute.name !== 'undefined' && attribute.name.name === destinationName;
    });

  if (destinationAttribute) {
    throw new Error('Destination Attribute cannot be present on JSX Element when using JSX Expressions');
  } else {
    sourceAttribute.name.name = destinationName;
  }
};
