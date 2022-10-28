const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.config');

/**
 * 开发配置
 * @param {*} config
 */
module.exports = merge(
  baseWebpackConfig({
    mode: 'production',
  }),
  {
    plugins: [],
    optimization: {
      splitChunks: {
        cacheGroups: {
          // 复用的文件，单独抽离 后续再优化此配置
          commons: {
            name: 'common',
            chunks: 'all',
            minChunks: 2,
            minSize: 1,
            priority: 0,
          },
          // 提取 node_modules 中代码
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 10,
          },
        },
      },
      minimize: true, //设置为true，使用 terser 和 css-minimizer
      minimizer: [
        new CssMinimizerPlugin(),
        new TerserPlugin({
          extractComments: false,
        }),
      ],
    },
  }
);
