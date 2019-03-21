// @flow

import BabelTypes, {
  binaryExpression,
  Identifier,
  isJSXExpressionContainer,
  isStringLiteral,
  jSXAttribute,
  JSXAttribute,
  jSXExpressionContainer,
  jSXIdentifier,
  stringLiteral,
  Expression
} from '@babel/types';
import type {
  GetClassNameOptionsType
} from './types';
import conditionalClassMerge from './conditionalClassMerge';
import createObjectExpression from './createObjectExpression';
import optionsDefaults from './schemas/optionsDefaults';

export default (
  t: BabelTypes,
  // eslint-disable-next-line flowtype/no-weak-types
  path: Object,
  sourceAttribute: JSXAttribute,
  destinationName: string,
  importedHelperIndentifier: Identifier,
  styleModuleImportMapIdentifier: Identifier,
  options: GetClassNameOptionsType,
  fromSpread?: Expression
): void => {
  const expressionContainerValue = sourceAttribute.value;
  const destinationAttribute = path.node.openingElement.attributes
    .find((attribute) => {
      return typeof attribute.name !== 'undefined' && attribute.name.name === destinationName;
    });

  if (destinationAttribute) {
    path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(destinationAttribute), 1);
  }

  path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(sourceAttribute), 1);

  const args = [
    expressionContainerValue.expression,
    styleModuleImportMapIdentifier
  ];

  // Only provide options argument if the options are something other than default
  // This helps save a few bits in the generated user code
  if (options.handleMissingStyleName !== optionsDefaults.handleMissingStyleName ||
    options.autoResolveMultipleImports !== optionsDefaults.autoResolveMultipleImports) {
    args.push(createObjectExpression(t, options));
  }

  const styleNameExpression = t.callExpression(
    t.clone(importedHelperIndentifier),
    args
  );

  if (destinationAttribute) {
    if (isStringLiteral(destinationAttribute.value)) {
      path.node.openingElement.attributes.push(jSXAttribute(
        jSXIdentifier(destinationName),
        jSXExpressionContainer(
          binaryExpression(
            '+',
            t.stringLiteral(destinationAttribute.value.value + ' '),
            styleNameExpression
          )
        )
      ));
    } else if (isJSXExpressionContainer(destinationAttribute.value)) {
      path.node.openingElement.attributes.push(jSXAttribute(
        jSXIdentifier(destinationName),
        jSXExpressionContainer(
          conditionalClassMerge(
            destinationAttribute.value.expression,
            styleNameExpression
          )
        )
      ));
    } else {
      throw new Error('Unexpected attribute value: ' + destinationAttribute.value);
    }

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
    path.node.openingElement.attributes.push(jSXAttribute(
      jSXIdentifier(destinationName),
      jSXExpressionContainer(
        fromSpread ?
          binaryExpression(
            '+',
            styleNameExpression,
            binaryExpression(
              '+',
              stringLiteral(' '),
              fromSpread
            )
          ) :
          styleNameExpression
      )
    ));
  }
};
