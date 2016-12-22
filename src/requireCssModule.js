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
import ScssSyntax from 'postcss-scss';
import LessSyntax from 'postcss-less';
import type {
  StyleModuleMapType
} from './types';

const getTokens = (runner, cssSourceFilePath: string): StyleModuleMapType => {
  const sourceFilePathIsScss = cssSourceFilePath.endsWith('.scss');
  const sourceFilePathIsLess = cssSourceFilePath.endsWith('.less');

  const options: Object = {
    from: cssSourceFilePath
  };

  if (sourceFilePathIsScss) {
    options.syntax = ScssSyntax;
  }

  if (sourceFilePathIsLess) {
    options.syntax = LessSyntax;
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
  generateScopedName?: string
|};

export default (cssSourceFilePath: string, options: OptionsType): StyleModuleMapType => {
  // eslint-disable-next-line prefer-const
  let runner;

  const scopedName = genericNames(options.generateScopedName);

  const fetch = (to: string, from: string) => {
    const fromDirectoryPath = dirname(from);
    const toPath = resolve(fromDirectoryPath, to);

    return getTokens(runner, toPath);
  };

  const plugins = [
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

  return getTokens(runner, cssSourceFilePath);
};
