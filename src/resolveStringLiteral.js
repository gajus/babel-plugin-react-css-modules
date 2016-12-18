// @flow

import {
  JSXAttribute
} from 'babel-types';
import getClassName from './getClassName';
import type {
  StyleModuleImportMapType
} from './types';

export default (path: Object, styleModuleImportMap: StyleModuleImportMapType, styleNameAttribute: JSXAttribute): void => {
  const classNameAttribute = path.node.openingElement.attributes
    .find((attribute) => {
      return typeof attribute.name !== 'undefined' && attribute.name.name === 'className';
    });

  const resolvedStyleName = getClassName(styleNameAttribute.value.value, styleModuleImportMap);

  if (classNameAttribute) {
    classNameAttribute.value.value += ' ' + resolvedStyleName;

    path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(styleNameAttribute), 1);
  } else {
    styleNameAttribute.name.name = 'className';
    styleNameAttribute.value.value = resolvedStyleName;
  }
};
