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
  let styleModuleImportMap;
  let importedHelperIndentifier;
  let styleModuleImportMapIdentifier;

  const setupFileForRuntimeResolution = (path) => {
    const programPath = path.findParent((parentPath) => {
      return parentPath.isProgram();
    });

    importedHelperIndentifier = programPath.scope.generateUidIdentifier('getClassName');
    styleModuleImportMapIdentifier = programPath.scope.generateUidIdentifier('styleModuleImportMap');

    programPath.unshiftContainer(
      'body',
      t.importDeclaration(
        [
          t.importDefaultSpecifier(
            importedHelperIndentifier
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
            styleModuleImportMapIdentifier,
            createObjectExpression(t, styleModuleImportMap)
          )
        ]
      )
    );
  };

  return {
    inherits: babelPluginJsxSyntax,
    visitor: {
      ImportDeclaration (path: Object, stats: Object): void {
        if (!path.node.source.value.endsWith('.css') && !path.node.source.value.endsWith('.scss')) {
          return;
        }

        const targetFileDirectoryPath = dirname(stats.file.opts.filename);
        const targetResourcePath = resolve(targetFileDirectoryPath, path.node.source.value);

        let styleImportName: string;

        if (path.node.specifiers.length === 0) {
          styleImportName = 'random-' + Math.random();
        } else if (path.node.specifiers.length === 1) {
          styleImportName = path.node.specifiers[0].local.name;
        } else {
          // eslint-disable-next-line no-console
          console.warn('Please report your use case. https://github.com/gajus/babel-plugin-react-css-modules/issues/new?title=Unexpected+use+case.');

          throw new Error('Unexpected use case.');
        }

        styleModuleImportMap[styleImportName] = requireCssModule(targetResourcePath, {
          generateScopedName: stats.opts.generateScopedName
        });
      },
      JSXElement (path: Object): void {
        const styleNameAttribute = path.node.openingElement.attributes
          .find((attribute) => {
            return attribute.name.name === 'styleName';
          });

        if (!styleNameAttribute) {
          return;
        }

        if (t.isStringLiteral(styleNameAttribute.value)) {
          resolveStringLiteral(path, styleModuleImportMap, styleNameAttribute);

          return;
        }

        if (t.isJSXExpressionContainer(styleNameAttribute.value)) {
          if (!importedHelperIndentifier) {
            setupFileForRuntimeResolution(path);
          }

          replaceJsxExpressionContainer(t, styleNameAttribute, importedHelperIndentifier, styleModuleImportMapIdentifier);
        }
      },
      Program () {
        styleModuleImportMap = {};
      }
    }
  };
};
