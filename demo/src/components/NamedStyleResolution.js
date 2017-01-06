/**
 * @file Demonstrates named "styleName" resolution.
 * @see https://github.com/gajus/babel-plugin-react-css-modules#named-stylename-resolution
 */

import React from 'react';
import table from './table.css';

export default () => {
  return <div styleName='table.table'>
    <div styleName='table.row'>
      <div styleName='table.cell'>A1</div>
      <div styleName='table.cell'>B1</div>
      <div styleName='table.cell'>C1</div>
    </div>
  </div>;
};
