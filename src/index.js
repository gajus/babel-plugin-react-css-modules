// @flow

import {
  dirname,
  resolve
} from 'path';
import babelPluginJsxSyntax from '@babel/plugin-syntax-jsx';
import BabelTypes from '@babel/types';
import ajvKeywords from 'ajv-keywords';
import Ajv from 'ajv';
import optionsSchema from './schemas/optionsSchema.json';
import optionsDefaults from './schemas/optionsDefaults';
import createObjectExpression from './createObjectExpression';
import requireCssModule from './requireCssModule';
import resolveStringLiteral from './resolveStringLiteral';
import replaceJsxExpressionContainer from './replaceJsxExpressionContainer';
import attributeNameExists from './attributeNameExists';
import findMatchedFiletype from './findMatchedFiletype';

const ajv = new Ajv({
  // eslint-disable-next-line id-match
  $data: true
});

ajvKeywords(ajv);

const validate = ajv.compile(optionsSchema);

export default ({
  types: t
}: {
  types: BabelTypes
}) => {
  const filenameMap = {};

  let skip = false;

  const setupFileForRuntimeResolution = (path, filename) => {
    const programPath = path.findParent((parentPath) => {
      return parentPath.isProgram();
    });

    filenameMap[filename].importedHelperIndentifier = programPath.scope.generateUidIdentifier('getClassName');
    filenameMap[filename].styleModuleImportMapIdentifier = programPath.scope.generateUidIdentifier('styleModuleImportMap');

    programPath.unshiftContainer(
      'body',
      t.importDeclaration(
        [
          t.importDefaultSpecifier(
            filenameMap[filename].importedHelperIndentifier
          )
        ],
        t.stringLiteral('babel-plugin-react-css-modules/dist/browser/getClassName')
      )
    );

    const firstNonImportDeclarationNode = programPath.get('body').find((node) => {
      return !t.isImportDeclaration(node);
    });

    firstNonImportDeclarationNode.insertBefore(
      t.variableDeclaration(
        'const',
        [
          t.variableDeclarator(
            filenameMap[filename].styleModuleImportMapIdentifier,
            createObjectExpression(t, filenameMap[filename].styleModuleImportMap)
          )
        ]
      )
    );
    // eslint-disable-next-line no-console
    // console.log('setting up', filename, util.inspect(filenameMap,{depth: 5}))
  };

  const addWebpackHotModuleAccept = (path) => {
    const test = t.memberExpression(t.identifier('module'), t.identifier('hot'));
    const consequent = t.blockStatement([
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(
            t.memberExpression(t.identifier('module'), t.identifier('hot')),
            t.identifier('accept')
          ),
          [
            t.stringLiteral(path.node.source.value),
            t.functionExpression(null, [], t.blockStatement([
              t.expressionStatement(
                t.callExpression(
                  t.identifier('require'),
                  [t.stringLiteral(path.node.source.value)]
                )
              )
            ]))
          ]
        )
      )
    ]);

    const programPath = path.findParent((parentPath) => {
      return parentPath.isProgram();
    });

    const firstNonImportDeclarationNode = programPath.get('body').find((node) => {
      return !t.isImportDeclaration(node);
    });

    const hotAcceptStatement = t.ifStatement(test, consequent);

    if (firstNonImportDeclarationNode) {
      firstNonImportDeclarationNode.insertBefore(hotAcceptStatement);
    } else {
      programPath.pushContainer('body', hotAcceptStatement);
    }
  };

  const getTargetResourcePath = (path: *, stats: *) => {
    const targetFileDirectoryPath = dirname(stats.file.opts.filename);

    if (path.node.source.value.startsWith('.')) {
      return resolve(targetFileDirectoryPath, path.node.source.value);
    }

    return require.resolve(path.node.source.value);
  };

  const isFilenameExcluded = (filename, exclude) => {
    return filename.match(new RegExp(exclude));
  };

  const notForPlugin = (path: *, stats: *) => {
    stats.opts.filetypes = stats.opts.filetypes || {};

    // @HACK
    if (path.node.source.value.indexOf('babel-plugin-react-css-modules') === 0) {
      return true;
    }

    const filename = getTargetResourcePath(path, stats);

    if (stats.opts.exclude && isFilenameExcluded(filename, stats.opts.exclude)) {
      return true;
    }

    const filetypeKeys = Object.keys(stats.opts.filetypes);

    filetypeKeys.push('.css');
    if (!findMatchedFiletype(filename, filetypeKeys)) {
      return true;
    }

    return false;
  };

  return {
    inherits: babelPluginJsxSyntax,
    visitor: {
      ImportDeclaration (path: *, stats: *): void {
        if (skip || notForPlugin(path, stats)) {
          return;
        }

        const filename = stats.file.opts.filename;
        const targetResourcePath = getTargetResourcePath(path, stats);

        let styleImportName: string;

        if (path.node.specifiers.length === 0) {
          // use imported file path as import name
          styleImportName = path.node.source.value;
        } else if (path.node.specifiers.length === 1) {
          styleImportName = path.node.specifiers[0].local.name;
        } else {
          // eslint-disable-next-line no-console
          console.warn('Please report your use case. https://github.com/gajus/babel-plugin-react-css-modules/issues/new?title=Unexpected+use+case.');

          throw new Error('Unexpected use case.');
        }

        filenameMap[filename].styleModuleImportMap[styleImportName] = requireCssModule(targetResourcePath, {
          context: stats.opts.context,
          filetypes: stats.opts.filetypes || {},
          generateScopedName: stats.opts.generateScopedName
        });

        if (stats.opts.webpackHotModuleReloading) {
          addWebpackHotModuleAccept(path);
        }

        if (stats.opts.removeImport) {
          path.remove();
        }
      },
      JSXElement (path: *, stats: *): void {
        if (skip) {
          return;
        }

        const filename = stats.file.opts.filename;

        if (stats.opts.exclude && isFilenameExcluded(filename, stats.opts.exclude)) {
          return;
        }

        let attributeNames = optionsDefaults.attributeNames;

        if (stats.opts && stats.opts.attributeNames) {
          attributeNames = Object.assign({}, attributeNames, stats.opts.attributeNames);
        }

        const attributes = path.node.openingElement.attributes
          .filter((attribute) => {
            return typeof attribute.name !== 'undefined' && typeof attributeNames[attribute.name.name] === 'string';
          });

        if (attributes.length === 0) {
          return;
        }

        const {
          handleMissingStyleName = optionsDefaults.handleMissingStyleName,
          autoResolveMultipleImports = optionsDefaults.autoResolveMultipleImports
        } = stats.opts || {};

        for (const attribute of attributes) {
          const destinationName = attributeNames[attribute.name.name];

          const options = {
            autoResolveMultipleImports,
            handleMissingStyleName
          };

          if (t.isStringLiteral(attribute.value)) {
            resolveStringLiteral(
              path,
              filenameMap[filename].styleModuleImportMap,
              attribute,
              destinationName,
              options
            );
          } else if (t.isJSXExpressionContainer(attribute.value)) {
            if (!filenameMap[filename].importedHelperIndentifier) {
              setupFileForRuntimeResolution(path, filename);
            }
            replaceJsxExpressionContainer(
              t,
              path,
              attribute,
              destinationName,
              filenameMap[filename].importedHelperIndentifier,
              filenameMap[filename].styleModuleImportMapIdentifier,
              options
            );
          }
        }
      },
      Program (path: *, stats: *): void {
        if (!validate(stats.opts)) {
          // eslint-disable-next-line no-console
          console.error(validate.errors);

          throw new Error('Invalid configuration');
        }

        const filename = stats.file.opts.filename;

        filenameMap[filename] = {
          styleModuleImportMap: {}
        };

        if (stats.opts.skip && !attributeNameExists(path, stats)) {
          skip = true;
        }
      }
    }
  };
};
