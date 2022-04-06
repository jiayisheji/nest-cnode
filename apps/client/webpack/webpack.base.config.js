const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { join, sep } = require('path');
const {
  getWebpackEntry,
  transformWebpackEntry,
  resolveViews,
  isPartials,
} = require('./utils');
const project = require('../project.json');
/** 源码路径 */
const sourceRoot = project.sourceRoot;
/** 输出路径 */
const outputPath = project.targets.build.options.outputPath;
/** 资源路径 */
const assetsPath = 'assets';
/** 模板路径 */
const viewsPath = 'views';
// console.log(sourceRoot, outputPath, assetsPath, viewsPath);

const webpackEntry = getWebpackEntry(
  join(sourceRoot, viewsPath).split(sep).join('/')
);

const layoutEntry = {
  name: 'layout',
  entry: './' + join(sourceRoot, viewsPath, 'layout.js').split(sep).join('/'),
  template:
    './' + join(sourceRoot, viewsPath, 'layout.hbs').split(sep).join('/'),
  filename: 'layout.hbs',
};

/**
 * 基础配置
 * @param {*} config
 */
module.exports = (config) => {
  const entry = transformWebpackEntry(webpackEntry, layoutEntry);
  console.log('entry', entry);
  const hash = config.mode === 'production';
  return {
    target: ['web', 'es5'],
    mode: config.mode,
    entry,
    output: {
      path: join(process.cwd(), outputPath),
      filename: (pathData) => {
        if (pathData.runtime === 'layout' || isPartials(pathData.runtime)) {
          return `${assetsPath}/js/layout.js`;
        }
        return `${assetsPath}/js/[name]${hash ? '.[chunkhash:7]' : ''}.js`;
      },
    },
    module: {
      rules: [
        // scss
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    'autoprefixer',
                    {
                      autoprefixer: { flex: true },
                      // browsers: ['ie10'],
                    },
                  ],
                },
                sourceMap: true,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        // images
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          type: 'asset',
          generator: {
            filename: `${assetsPath}/images/[name]${
              hash ? '.[hash:7]' : ''
            }[ext]`, // 局部指定输出位置
          },
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 限制于 8kb
            },
          },
        },
        // fonts
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          type: 'asset',
          generator: {
            filename: `${assetsPath}/fonts/[name]${
              hash ? '.[hash:7]' : ''
            }[ext]`, // 局部指定输出位置
          },
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 限制于 8kb
            },
          },
        },
      ],
    },
    plugins: [
      // https://webpack.js.org/plugins/mini-css-extract-plugin/
      new MiniCssExtractPlugin({
        filename: `${assetsPath}/css/[name]${hash ? '.[chunkhash:7]' : ''}.css`,
        chunkFilename: `[name]${hash ? '.[chunkhash:7]' : ''}.css`,
        linkType: 'text/css',
      }),
      ...resolveViews(webpackEntry, {
        views: viewsPath,
        layout: {
          name: 'layout',
          filename: viewsPath + '/' + layoutEntry.filename,
          template: layoutEntry.template,
          reload: config.mode === 'development',
        },
      }),
    ],
  };
};
