// @flow

import {
  dirname,
  resolve
} from 'path';
import {
  readFileSync
} from 'fs';
import postcss from 'postcss';
import genericNames from 'generic-names';
import ExtractImports from 'postcss-modules-extract-imports';
import LocalByDefault from 'postcss-modules-local-by-default';
import Parser from 'postcss-modules-parser';
import Scope from 'postcss-modules-scope';
import Values from 'postcss-modules-values';
import type {
  StyleModuleMapType
} from './types';

type FileTypeOptions = {|
  +syntax: string,
  // eslint-disable-next-line no-undef
  +plugins?: $ReadOnlyArray<string>
|};

const getFiletypeOptions = (cssSourceFilePath: string, filetypes: {[key: string]: FileTypeOptions}): ?FileTypeOptions => {
  const extension = cssSourceFilePath.substr(cssSourceFilePath.lastIndexOf('.'));
  const filetype = filetypes ? filetypes[extension] : null;

  return filetype;
};

const getSyntax = (filetypeOptions: FileTypeOptions): ?(Function|Object) => {
  if (!filetypeOptions) {
    return null;
  }

  // eslint-disable-next-line import/no-dynamic-require, global-require
  return require(filetypeOptions.syntax);
};

// eslint-disable-next-line no-undef
const getExtraPlugins = (filetypeOptions: ?FileTypeOptions): $ReadOnlyArray<any> => {
  if (!filetypeOptions || !filetypeOptions.plugins) {
    return [];
  }

  return filetypeOptions.plugins.map((plugin) => {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    return require(plugin);
  });
};

const getTokens = (runner, cssSourceFilePath: string, filetypeOptions: ?FileTypeOptions): StyleModuleMapType => {
  const options: Object = {
    from: cssSourceFilePath
  };

  if (filetypeOptions) {
    options.syntax = getSyntax(filetypeOptions);
  }

  const lazyResult = runner
    .process(readFileSync(cssSourceFilePath, 'utf-8'), options);

  lazyResult
    .warnings()
    .forEach((message) => {
      // eslint-disable-next-line no-console
      console.warn(message.text);
    });

  return lazyResult.root.tokens;
};

type OptionsType = {|
  filetypes: Object,
  generateScopedName?: string,
  context?: string
|};

export default (cssSourceFilePath: string, options: OptionsType): StyleModuleMapType => {
  // eslint-disable-next-line prefer-const
  let runner;

  const scopedName = genericNames(options.generateScopedName || '[path]___[name]__[local]___[hash:base64:5]', {
    context: options.context || process.cwd()
  });

  const filetypeOptions = getFiletypeOptions(cssSourceFilePath, options.filetypes);

  const fetch = (to: string, from: string) => {
    const fromDirectoryPath = dirname(from);
    const toPath = resolve(fromDirectoryPath, to);

    return getTokens(runner, toPath, filetypeOptions);
  };

  const extraPlugins = getExtraPlugins(filetypeOptions);

  const plugins = [
    ...extraPlugins,
    Values,
    LocalByDefault,
    ExtractImports,
    new Scope({
      generateScopedName: scopedName
    }),
    new Parser({
      fetch
    })
  ];

  runner = postcss(plugins);

  return getTokens(runner, cssSourceFilePath, filetypeOptions);
};
