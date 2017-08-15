// @flow

import type {
  StyleModuleMapType,
  StyleModuleImportMapType
} from './types';

const isNamespacedStyleName = (styleName: string): boolean => {
  return styleName.indexOf('.') !== -1;
};

const getClassNameForNamespacedStyleName = (styleName: string, styleModuleImportMap: StyleModuleImportMapType): string => {
  // Note:
  // Do not use the desctructing syntax with Babel.
  // Desctructing adds _slicedToArray helper.
  const styleNameParts = styleName.split('.');
  const importName = styleNameParts[0];
  const moduleName = styleNameParts[1];

  if (!moduleName) {
    // eslint-disable-next-line no-console
    console.log({
      moduleName
    });

    throw new Error('Invalid style name.');
  }

  if (!styleModuleImportMap[importName]) {
    // eslint-disable-next-line no-console
    console.log({
      importName
    });

    throw new Error('CSS module import does not exist.');
  }

  if (!styleModuleImportMap[importName][moduleName]) {
    // eslint-disable-next-line no-console
    console.log({
      importName,
      moduleName
    });

    throw new Error('CSS module does not exist.');
  }

  return styleModuleImportMap[importName][moduleName];
};

export default (styleNameValue: string, styleModuleImportMap: StyleModuleImportMapType): string => {
  const styleModuleImportMapKeys = Object.keys(styleModuleImportMap);

  return styleNameValue
    .split(' ')
    .filter((styleName) => {
      return styleName;
    })
    .map((styleName) => {
      if (isNamespacedStyleName(styleName)) {
        return getClassNameForNamespacedStyleName(styleName, styleModuleImportMap);
      }

      if (styleModuleImportMapKeys.length === 0) {
        throw new Error('Cannot use styleName attribute without importing at least one stylesheet.');
      }

      if (styleModuleImportMapKeys.length > 1) {
        throw new Error('Cannot use anonymous style name with more than one stylesheet import.');
      }

      const styleModuleMap: StyleModuleMapType = styleModuleImportMap[styleModuleImportMapKeys[0]];

      if (!styleModuleMap[styleName]) {
        // eslint-disable-next-line no-console
        console.log({
          styleName
        });

        throw new Error('Could not resolve a styleName.');
      }

      return styleModuleMap[styleName];
    })
    .join(' ');
};
