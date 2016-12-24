// @flow

import {
  dirname,
  resolve
} from 'path';
import babelPluginJsxSyntax from 'babel-plugin-syntax-jsx';
import BabelTypes from 'babel-types';
import createObjectExpression from './createObjectExpression';
import requireCssModule from './requireCssModule';
import resolveStringLiteral from './resolveStringLiteral';
import replaceJsxExpressionContainer from './replaceJsxExpressionContainer';

export default ({
  types: t
}: {
  types: BabelTypes
}) => {
  const filenameMap = {};
  const cursors = {};

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

    cursors[filename].insertAfter(
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
    // eslint-disable-next-line
    // console.log('setting up', filename, util.inspect(filenameMap,{depth: 5}))
  };

  return {
    inherits: babelPluginJsxSyntax,
    visitor: {
      ImportDeclaration (path: Object, stats: Object): void {
        if (!path.node.source.value.endsWith('.css') && !path.node.source.value.endsWith('.scss')) {
          return;
        }

        const filename = stats.file.opts.filename;
        const targetFileDirectoryPath = dirname(stats.file.opts.filename);
        const targetResourcePath = resolve(targetFileDirectoryPath, path.node.source.value);

        let styleImportName: string;

        if (path.node.specifiers.length === 0) {
          // eslint-disable-next-line no-process-env
          styleImportName = process.env.NODE_ENV === 'test' ? 'random-test' : 'random-' + Math.random();
        } else if (path.node.specifiers.length === 1) {
          styleImportName = path.node.specifiers[0].local.name;
        } else {
          // eslint-disable-next-line no-console
          console.warn('Please report your use case. https://github.com/gajus/babel-plugin-react-css-modules/issues/new?title=Unexpected+use+case.');

          throw new Error('Unexpected use case.');
        }

        filenameMap[filename].styleModuleImportMap[styleImportName] = requireCssModule(targetResourcePath, {
          generateScopedName: stats.opts.generateScopedName
        });

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

        const hotAcceptStatement = t.ifStatement(test, consequent);

        if (cursors[filename]) {
          cursors[filename] = cursors[filename].insertAfter(hotAcceptStatement)[0];
        } else {
          const programPath = path.findParent((parentPath) => {
            return parentPath.isProgram();
          });

          const firstNonImportDeclarationNode = programPath.get('body').find((node) => {
            return !t.isImportDeclaration(node);
          });

          cursors[filename] = firstNonImportDeclarationNode.insertBefore(hotAcceptStatement)[0];
        }
      },
      JSXElement (path: Object, stats: Object): void {
        const filename = stats.file.opts.filename;
        const styleNameAttribute = path.node.openingElement.attributes
          .find((attribute) => {
            return typeof attribute.name !== 'undefined' && attribute.name.name === 'styleName';
          });

        if (!styleNameAttribute) {
          return;
        }

        if (t.isStringLiteral(styleNameAttribute.value)) {
          resolveStringLiteral(
            path,
            filenameMap[filename].styleModuleImportMap,
            styleNameAttribute
          );

          return;
        }

        if (t.isJSXExpressionContainer(styleNameAttribute.value)) {
          if (!filenameMap[filename].importedHelperIndentifier) {
            setupFileForRuntimeResolution(path, filename);
          }
          replaceJsxExpressionContainer(
            t,
            path,
            styleNameAttribute,
            filenameMap[filename].importedHelperIndentifier,
            filenameMap[filename].styleModuleImportMapIdentifier
          );
        }
      },
      Program (path: Object, stats: Object): void {
        const filename = stats.file.opts.filename;

        filenameMap[filename] = {
          styleModuleImportMap: {}
        };

        cursors[filename] = null;
      }
    }
  };
};
