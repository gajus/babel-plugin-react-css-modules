// @flow

import {
  binaryExpression,
  conditionalExpression,
  stringLiteral
} from 'babel-types';

/* eslint-disable flowtype/no-weak-types */

export default (
  classNameExpression: any,
  styleNameExpression: any,
  styleNameFirst: boolean,
): any => {
  if (styleNameFirst) {
    return binaryExpression(
      '+',
      styleNameExpression,
      conditionalExpression(
        classNameExpression,
        binaryExpression(
          '+',
          stringLiteral(' '),
          classNameExpression
        ),
        stringLiteral('')
      )
    );
  }

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
