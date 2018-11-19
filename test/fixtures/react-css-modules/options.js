/**
 * @file Provides the base options object that applies to all tests.
 * https://github.com/babel/babel/blob/master/CONTRIBUTING.md#writing-tests
 */
const { resolve } = require('path');

module.exports = {
  sourceType: 'module',
  presets: [
    [
      '@babel/env',
      {
        targets: {
          node: '8.0',
        },
      },
    ],
  ],
  "plugins": [
    [
      resolve(__dirname, '../../../src'),
      {
        "generateScopedName": "[name]__[local]"
      }
    ]
  ]
};
