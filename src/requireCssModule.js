// @flow

import {
  dirname,
  resolve,
  basename
} from 'path';
import {
  readFileSync,
  writeFileSync,
  appendFileSync
} from 'fs';
import mkdirp from 'mkdirp';
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

const writeCssFile = (filename, content) => {
  mkdirp.sync(dirname(filename));
  writeFileSync(filename, content);
};

const appendCssFile = (filename, content) => {
  mkdirp.sync(dirname(filename));
  appendFileSync(filename, content);
};

let hasWrite = false;
const cssSourceFilePathArr = [];

const wirteCssToFile = (path, lazyResult) => {
  const correspondingMapPath = `${path}.map`;

  if (!hasWrite) {
    writeCssFile(path, lazyResult.css);

    if (lazyResult.map) {
      writeCssFile(correspondingMapPath, lazyResult.map);
    }

    hasWrite = true;
  } else {
    appendCssFile(path, lazyResult.css);

    if (lazyResult.map) {
      appendCssFile(correspondingMapPath, lazyResult.map);
    }
  }
};

const getTokens = (runner, cssSourceFilePath: string, filetypes, extractCssOpts): StyleModuleMapType => {
  const extension = cssSourceFilePath.substr(cssSourceFilePath.lastIndexOf('.'));
  const syntax = filetypes[extension];

  const options: Object = {
    from: cssSourceFilePath
  };

  if (syntax) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    options.syntax = require(syntax);
  }

  const lazyResult = runner
    .process(readFileSync(cssSourceFilePath, 'utf-8'), options);

  // only if the css which we import doesn't be written before,we wirte it to the file
  if (cssSourceFilePathArr.indexOf(cssSourceFilePath) === -1 && extractCssOpts) {
    if (extractCssOpts.to) {
      const toPath = extractCssOpts.to;

      wirteCssToFile(resolve(process.cwd(), `../../${toPath}`), lazyResult);
    } else if (extractCssOpts.stayInOwnComponent) {
      const filename = basename(cssSourceFilePath);

      wirteCssToFile(resolve(cssSourceFilePath, `../cssModule/${filename}`), lazyResult);
    }
  }

  lazyResult
    .warnings()
    .forEach((message) => {
      // eslint-disable-next-line no-console
      console.warn(message.text);
    });

  // after write css to the file,we push the path to the array to avoid we write the same css repeatedly
  cssSourceFilePathArr.push(cssSourceFilePath);

  return lazyResult.root.tokens;
};

type OptionsType = {|
  filetypes: Object,
  extractCss: Object,
  generateScopedName?: string,
  context?: string
|};

export default (cssSourceFilePath: string, options: OptionsType): StyleModuleMapType => {
  // eslint-disable-next-line prefer-const
  let runner;

  const scopedName = genericNames(options.generateScopedName || '[path]___[name]__[local]___[hash:base64:5]', {
    context: options.context || process.cwd()
  });

  const fetch = (to: string, from: string) => {
    const fromDirectoryPath = dirname(from);
    const toPath = resolve(fromDirectoryPath, to);

    return getTokens(runner, toPath, options.filetypes, options.extractCss);
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

  return getTokens(runner, cssSourceFilePath, options.filetypes, options.extractCss);
};
