const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { getOutputHashFormat } = require('@nrwl/webpack/src/utils/hash-format');
const paths = require('./webpack/paths');
const HandlebarsRenderPlugin = require('./webpack/handlebars-render-plugin');
const { composePlugins, withNx, withWeb } = require('@nrwl/webpack');

const htmlWebpackPluginOptions = paths.appHtml().reduce((options, html) => {
  return [
    ...options,
    {
      template: html.template,
      chunks: html.chunks,
      filename: html.filename,
      inject: false,
      minify: {
        removeComments: true,
      },
    },
  ];
}, []);

// Nx plugins for webpack.
module.exports = composePlugins(withNx({ skipTypeChecking: true }), withWeb(), (config, { options, context }) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.entry = paths.appEntry();
  // Determine hashing format.
  const hashFormat = getOutputHashFormat(options.outputHashing);
  config.output.publicPath = '/';
  config.output.filename = 'assets/js/' + config.output.filename;
  config.output.chunkFilename = 'assets/js/' + config.output.chunkFilename;
  config.output.assetModuleFilename = `assets/images/[name]${hashFormat.file}.[ext]`;

  for (let i = 0; i < config.plugins.length; i++) {
    if (config.plugins[i].constructor.name === MiniCssExtractPlugin.name) {
      const { filename, chunkFilename } = config.plugins[i].options;
      config.plugins[i].options.filename = `assets/css/${filename}`;
      config.plugins[i].options.chunkFilename = `assets/css/${chunkFilename}`;
    }
  }

  config.plugins.push(
    new HandlebarsRenderPlugin({
      htmlWebpackPluginOptions,
      reload: config.mode === 'development',
      layout: 'views/layout.hbs',
    })
  );

  return config;
});
