// @flow

import {
  binaryExpression,
  conditionalExpression,
  stringLiteral
} from '@babel/types';

/* eslint-disable flowtype/no-weak-types */

export default (
  classNameExpression: any,
  styleNameExpression: any,
): any => {
  // classNameExpression ? (classNameExpression + ' ') : '' + styleNameExpression
  return binaryExpression(
    '+',
    conditionalExpression(
      classNameExpression,
      binaryExpression(
        '+',
        classNameExpression,
        stringLiteral(' ')
      ),
      stringLiteral('')
    ),
    styleNameExpression
  );
};
