/* eslint-disable filenames/match-regex, import/no-commonjs */

const path = require('path');
const context = path.resolve(__dirname, 'src');

module.exports = {
  context,
  entry: './index.js',
  module: {
    loaders: [
      {
        include: path.resolve(__dirname, './src'),
        loaders: [
          'style-loader',
          'css-loader?importLoader=1&modules&localIdentName=[path]___[name]__[local]___[hash:base64:5]'
        ],
        test: /\.css$/
      },
      {
        include: path.resolve(__dirname, './src'),
        loader: 'babel-loader',
        query: {
          plugins: [
            '@babel/transform-react-jsx',
            [
              'react-css-modules',
              {
                context
              }
            ]
          ]
        },
        test: /\.js$/
      }
    ]
  },
  output: {
    filename: '[name].js'
  },
  stats: 'minimal'
};
