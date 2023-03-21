const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { getOutputHashFormat } = require('@nrwl/webpack/src/utils/hash-format');
const paths = require('./webpack/paths');
const HandlebarsRenderPlugin = require('./webpack/handlebars-render-plugin');
const { composePlugins, withNx, withWeb } = require('@nrwl/webpack');

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx({ skipTypeChecking: true }),
  withWeb({
    stylePreprocessorOptions: {
      includePaths: ['apps/client/src/views/shared/styles'],
    },
    styles: ['apps/client/src/views/styles.scss'],
  }),
  (config, { options, context }) => {
    // Update the webpack config as needed here.
    // e.g. `config.plugins.push(new MyPlugin())`
    const { main, ...entry } = config.entry;

    config.entry = {
      ...entry,
      ...paths.appEntry(),
    };

    const htmlWebpackPluginOptions = paths.appHtml(Object.keys(entry)).reduce((options, html) => {
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

    // Determine hashing format.
    const hashFormat = getOutputHashFormat(options.outputHashing);
    config.output.publicPath = '/';
    config.output.filename = 'assets/js/' + config.output.filename;
    config.output.chunkFilename = 'assets/js/' + config.output.chunkFilename;
    config.output.assetModuleFilename = `assets/images/[name]${hashFormat.file}.[ext]`;

    config.module.rules.push({
      test: /\.hbs$/,
      use: [
        {
          loader: require.resolve('html-loader'),
          options: {
            esModule: false,
            minimize: false,
            sources: {
              /**
               * url处理过滤 返回 false 不处理
               * @param {string} attribute 属性名
               * @param {string} value 属性值
               * @param {string} resourcePath 处理资源路径
               * @returns
               */
              urlFilter: (attribute, value, resourcePath) => {
                // 排除 /assets/ 开头 不需要处理
                if (value.startsWith('/assets/')) {
                  return false;
                }
                return true;
              },
            },
          },
        },
      ],
    });

    for (let i = 0; i < config.plugins.length; i++) {
      if (config.plugins[i].constructor.name === MiniCssExtractPlugin.name) {
        const { filename, chunkFilename } = config.plugins[i].options;
        config.plugins[i].options.filename = `assets/css/${filename}`;
        if (chunkFilename) {
          config.plugins[i].options.chunkFilename = `assets/css/${chunkFilename}`;
        }
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
  }
);
