// @flow

import {
  binaryExpression,
  cloneNode,
  conditionalExpression,
  stringLiteral,
} from '@babel/types';

/* eslint-disable flowtype/no-weak-types */

export default (
  classNameExpression: any,
  styleNameExpression: any,
): any => {
  return binaryExpression(
    '+',
    conditionalExpression(
      cloneNode(classNameExpression),
      binaryExpression(
        '+',
        cloneNode(classNameExpression),
        stringLiteral(' '),
      ),
      stringLiteral(''),
    ),
    cloneNode(styleNameExpression),
  );
};
