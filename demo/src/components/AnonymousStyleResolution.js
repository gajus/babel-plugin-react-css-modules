/**
 * @file Demonstrates anonymous "styleName" resolution.
 * @see https://github.com/gajus/babel-plugin-react-css-modules#anonymous-stylename-resolution
 */

import React from 'react';
import './table.css';

export default () => {
  return <div styleName='table'>
    <div styleName='row'>
      <div styleName='cell'>A0</div>
      <div styleName='cell'>B0</div>
      <div styleName='cell'>C0</div>
    </div>
  </div>;
};
