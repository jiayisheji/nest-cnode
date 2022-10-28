const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const baseWebpackConfig = require('./webpack.base.config');

/**
 * 开发配置
 * @param {*} config
 */
module.exports = merge(
  baseWebpackConfig({
    mode: 'development',
  }),
  {
    watch: true,
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300,
      poll: 1000,
    },
    plugins: [],
  }
);