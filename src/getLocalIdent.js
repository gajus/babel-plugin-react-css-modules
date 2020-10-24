/**
 * getLocalIdent() function taken from css-loader@5.0.0.
 */

import path from 'path';
import cssesc from 'cssesc';
import {
  interpolateName,
} from 'loader-utils';

// eslint-disable-next-line no-control-regex
const filenameReservedRegex = /["*/:<>?\\|]/g;
// eslint-disable-next-line no-control-regex
const reControlChars = /[\u0000-\u001f\u0080-\u009f]/g;

const normalizePath = (file) => {
  return path.sep === '\\' ? file.replace(/\\/g, '/') : file;
};

const escapeLocalIdent = (localident) => {
  return cssesc(
    localident

      // For `[hash]` placeholder
      .replace(/^((-?\d)|--)/, '_$1')
      .replace(filenameReservedRegex, '-')
      .replace(reControlChars, '-')
      .replace(/\./g, '-'),
    {isIdentifier: true},
  );
};

export default function getLocalIdent (
  loaderContext,
  localIdentName,
  localName,
  options,
) {
  const {context, hashPrefix} = options;
  const {resourcePath} = loaderContext;
  const request = normalizePath(path.relative(context, resourcePath));

  // eslint-disable-next-line no-param-reassign
  options.content = `${hashPrefix + request}\u0000${localName}`;

  const ident = interpolateName(loaderContext, localIdentName, options)
    .replace(/\[local]/gi, localName);

  return escapeLocalIdent(ident);
}
