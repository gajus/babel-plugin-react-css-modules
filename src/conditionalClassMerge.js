// @flow

import {
  binaryExpression,
  conditionalExpression,
  stringLiteral
} from 'babel-types';

export default (
  classNameExpression: any,
  styleNameExpression: any,
): any => {
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
