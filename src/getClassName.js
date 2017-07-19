// @flow

import type {
  StyleModuleMapType,
  StyleModuleImportMapType
} from './types';

const isNamespacedStyleName = (styleName: string): boolean => {
  return styleName.indexOf('.') !== -1;
};

const getClassNameForNamespacedStyleName = (styleName: string, styleModuleImportMap: StyleModuleImportMapType, silenceErrors: boolean): ?string => {
  // Note:
  // Do not use the desctructing syntax with Babel.
  // Desctructing adds _slicedToArray helper.
  const styleNameParts = styleName.split('.');
  const importName = styleNameParts[0];
  const moduleName = styleNameParts[1];

  if (!moduleName) {
    if (silenceErrors) {
      return null;
    } else {
      throw new Error('Invalid style name.');
    }
  }

  if (!styleModuleImportMap[importName]) {
    if (silenceErrors) {
      return null;
    } else {
      throw new Error('CSS module import does not exist.');
    }
  }

  if (!styleModuleImportMap[importName][moduleName]) {
    if (silenceErrors) {
      return null;
    } else {
      throw new Error('CSS module does not exist.');
    }
  }

  return styleModuleImportMap[importName][moduleName];
};

type OptionsType = {|
  silenceStyleNameErrors: boolean
|};

export default (styleNameValue: string, styleModuleImportMap: StyleModuleImportMapType, options?: OptionsType): string => {
  const styleModuleImportMapKeys = Object.keys(styleModuleImportMap);
  const silenceStyleNameErrors = Boolean(options && options.silenceStyleNameErrors);

  return styleNameValue
    .split(' ')
    .filter((styleName) => {
      return styleName;
    })
    .map((styleName) => {
      if (isNamespacedStyleName(styleName)) {
        return getClassNameForNamespacedStyleName(styleName, styleModuleImportMap, silenceStyleNameErrors);
      }

      if (styleModuleImportMapKeys.length === 0) {
        throw new Error('Cannot use styleName attribute without importing at least one stylesheet.');
      }

      if (styleModuleImportMapKeys.length > 1) {
        throw new Error('Cannot use anonymous style name with more than one stylesheet import.');
      }

      const styleModuleMap: StyleModuleMapType = styleModuleImportMap[styleModuleImportMapKeys[0]];

      if (!styleModuleMap[styleName] && !silenceStyleNameErrors) {
        throw new Error('Could not resolve the styleName \'' + styleName + '\'.');
      }

      return styleModuleMap[styleName];
    })
    .filter((className) => {
      // Remove any styles which could not be found (if silenceStyleNameErrors)
      return className;
    })
    .join(' ');
};
