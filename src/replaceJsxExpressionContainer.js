// @flow

import BabelTypes, {
  JSXAttribute,
  Identifier
} from 'babel-types';

export default (
  t: BabelTypes,
  path: Object,
  styleNameAttribute: JSXAttribute,
  importedHelperIndentifier: Identifier,
  styleModuleImportMapIdentifier: Identifier
): void => {
  const expressionContainerValue = styleNameAttribute.value;
  const classNameAttribute = path.node.openingElement.attributes
    .find((attribute) => {
      return typeof attribute.name !== 'undefined' && attribute.name.name === 'className';
    });
  const classNameAttributeValue = classNameAttribute ? classNameAttribute.value.value : '';

  if (classNameAttribute) {
    path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(classNameAttribute), 1);
  }

  const styleNameExpression = t.callExpression(
    importedHelperIndentifier,
    [
      expressionContainerValue.expression,
      styleModuleImportMapIdentifier
    ]
  );

  styleNameAttribute.value = t.jSXExpressionContainer(
    classNameAttribute ?
      t.binaryExpression(
        '+',
        t.stringLiteral(classNameAttributeValue + ' '),
        styleNameExpression
      ) : styleNameExpression
  );
  styleNameAttribute.name.name = 'className';
};
