// @flow

export type StyleModuleMapType = {
  [key: string]: string
};

export type StyleModuleImportMapType = {
  [key: string]: StyleModuleMapType
};

export type GenerateScopedNameType = (localName: string, resourcePath: string) => string;

export type GenerateScopedNameConfigurationType = GenerateScopedNameType | string;

export type HandleMissingStyleNameOptionType = 'throw' | 'warn' | 'ignore';
