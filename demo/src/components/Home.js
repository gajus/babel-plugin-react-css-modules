/**
 * @file Demonstrates anonymous "styleName" resolution.
 * @see https://github.com/gajus/babel-plugin-react-css-modules#anonymous-stylename-resolution
 */

import React from 'react';
import 'home.css';

export default () => {
  return <div><h1 styleName="home">this is a title</h1></div>
};
