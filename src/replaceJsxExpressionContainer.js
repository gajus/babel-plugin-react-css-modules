// @flow
import BabelTypes, {
  binaryExpression,
  Identifier,
  isJSXExpressionContainer,
  isStringLiteral,
  jSXAttribute,
  JSXAttribute,
  jSXExpressionContainer,
  jSXIdentifier
} from 'babel-types';
import type {
  HandleMissingStyleNameOptionType
} from './types';
import conditionalClassMerge from './conditionalClassMerge';
import createObjectExpression from './createObjectExpression';
import optionsDefaults from './schemas/optionsDefaults';

type OptionsType = {|
  handleMissingStyleName: HandleMissingStyleNameOptionType
|};

export default (
  t: BabelTypes,
  // eslint-disable-next-line flowtype/no-weak-types
  path: Object,
  styleNameAttribute: JSXAttribute,
  importedHelperIndentifier: Identifier,
  styleModuleImportMapIdentifier: Identifier,
  options: OptionsType
): void => {
  const expressionContainerValue = styleNameAttribute.value;
  const classNameAttribute = path.node.openingElement.attributes
    .find((attribute) => {
      return typeof attribute.name !== 'undefined' && attribute.name.name === 'className';
    });

  if (classNameAttribute) {
    path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(classNameAttribute), 1);
  }

  path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(styleNameAttribute), 1);

  const args = [
    expressionContainerValue.expression,
    styleModuleImportMapIdentifier
  ];

  // Only provide options argument if the options are something other than default
  // This helps save a few bits in the generated user code
  if (options.handleMissingStyleName !== optionsDefaults.handleMissingStyleName) {
    args.push(createObjectExpression(t, options));
  }

  const styleNameExpression = t.callExpression(
    t.clone(importedHelperIndentifier),
    args
  );

  if (classNameAttribute) {
    if (isStringLiteral(classNameAttribute.value)) {
      path.node.openingElement.attributes.push(jSXAttribute(
        jSXIdentifier('className'),
        jSXExpressionContainer(
          binaryExpression(
            '+',
            t.stringLiteral(classNameAttribute.value.value + ' '),
            styleNameExpression
          )
        )
      ));
    } else if (isJSXExpressionContainer(classNameAttribute.value)) {
      path.node.openingElement.attributes.push(jSXAttribute(
        jSXIdentifier('className'),
        jSXExpressionContainer(
          conditionalClassMerge(
            classNameAttribute.value.expression,
            styleNameExpression
          )
        )
      ));
    } else {
      throw new Error('Unexpected attribute value.');
    }
  } else {
    path.node.openingElement.attributes.push(jSXAttribute(
      jSXIdentifier('className'),
      jSXExpressionContainer(
        styleNameExpression
      )
    ));
  }
};
