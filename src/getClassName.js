// @flow

import type {
  StyleModuleMapType,
  StyleModuleImportMapType
} from './types';

const isNamespacedStyleName = (styleName: string): boolean => {
  return styleName.includes('.');
};

const getClassNameForNamespacedStyleName = (styleName: string, styleModuleImportMap: StyleModuleImportMapType): string => {
  const [
    importName,
    moduleName
  ] = styleName.split('.');

  if (!moduleName) {
    throw new Error('Invalid style name.');
  }

  if (!styleModuleImportMap.hasOwnProperty(importName)) {
    throw new Error('Import does not exist.');
  }

  if (!styleModuleImportMap[importName].hasOwnProperty(moduleName)) {
    throw new Error('Module does not exist.');
  }

  return styleModuleImportMap[importName][moduleName];
};

export default (styleNameValue: string, styleModuleImportMap: StyleModuleImportMapType): string => {
  return styleNameValue
    .split(' ')
    .map((styleName) => {
      if (isNamespacedStyleName(styleName)) {
        return getClassNameForNamespacedStyleName(styleName, styleModuleImportMap);
      }

      if (Object.keys(styleModuleImportMap).length === 0) {
        throw new Error('Cannot use styleName attribute without importing at least one stylesheet.');
      }

      if (Object.keys(styleModuleImportMap).length > 1) {
        throw new Error('Cannot use anonymous style name with more than one stylesheet import.');
      }

      const styleModuleMap: StyleModuleMapType = styleModuleImportMap[Object.keys(styleModuleImportMap)[0]];

      if (!styleModuleMap.hasOwnProperty(styleName)) {
        throw new Error('Module cannot be resolved.');
      }

      return styleModuleMap[styleName];
    })
    .join(' ');
};
