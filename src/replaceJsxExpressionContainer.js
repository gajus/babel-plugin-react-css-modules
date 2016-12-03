// @flow

import BabelTypes, {
  JSXAttribute,
  Identifier
} from 'babel-types';

export default (t: BabelTypes, styleNameAttribute: JSXAttribute, importedHelperIndentifier: Identifier, styleModuleImportMapIdentifier: Identifier): void => {
  const expressionContainerValue = styleNameAttribute.value;

  styleNameAttribute.value = t.jSXExpressionContainer(
    t.callExpression(
      importedHelperIndentifier,
      [
        expressionContainerValue.expression,
        styleModuleImportMapIdentifier
      ]
    )
  );
};
