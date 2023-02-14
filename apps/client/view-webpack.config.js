const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const paths = require('./webpack/paths');
const HandlebarsRenderPlugin = require('./webpack/handlebars-render-plugin');
const { getOutputHashFormat } = require('@nrwl/webpack/src/utils/hash-format');
/**
 * 扩展打包配置
 * @param {WebpackConfig} webpackConfig
 * @param {object} nxContext
 * @returns {WebpackConfig}
 */
module.exports = (webpackConfig, { options, context }) => {
  webpackConfig.entry = paths.appEntry();
  // Determine hashing format.
  const hashFormat = getOutputHashFormat(options.outputHashing);
  webpackConfig.output.publicPath = '/';
  webpackConfig.output.filename = 'assets/js/' + webpackConfig.output.filename;
  webpackConfig.output.chunkFilename = 'assets/js/' + webpackConfig.output.chunkFilename;
  webpackConfig.output.assetModuleFilename = `assets/images/[name]${hashFormat.file}.[ext]`;

  for (let i = 0; i < webpackConfig.plugins.length; i++) {
    if (webpackConfig.plugins[i].constructor.name === MiniCssExtractPlugin.name) {
      const { filename, chunkFilename } = webpackConfig.plugins[i].options;
      webpackConfig.plugins[i].options.filename = `assets/css/${filename}`;
      webpackConfig.plugins[i].options.chunkFilename = `assets/css/${chunkFilename}`;
    }
  }

  webpackConfig.plugins.push(new HandlebarsRenderPlugin());
  return webpackConfig;
};