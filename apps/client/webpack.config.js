const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
const { join } = require('path');
/**
 * 扩展打包配置
 * @param {WebpackConfig} webpackConfig
 * @param {object} nxContext
 * @returns {WebpackConfig}
 */
module.exports = (webpackConfig, { options, context }) => {
  //  fix di error 禁用压缩
  if (webpackConfig.mode === 'production') {
    if (webpackConfig.optimization == null) {
      webpackConfig.optimization = {};
    }
    webpackConfig.optimization.minimize = false;
    // fix package.json useless dependency
    if (options.generatePackageJson) {
      for (let i = 0; i < webpackConfig.plugins.length; i++) {
        console.log(webpackConfig.plugins[i].constructor);
        if (webpackConfig.plugins[i].constructor.name === 'GeneratePackageJsonPlugin') {
          webpackConfig.plugins[i] = new GeneratePackageJsonPlugin(
            {
              name: context.projectName,
              version: '0.0.1',
              dependencies: {},
              main: options.outputFileName,
            },
            {
              useInstalledVersions: true,
              forceWebpackVersion: 'webpack5',
              resolveContextPaths: [options.root],
              sourcePackageFilenames: [join(options.root, 'package.json')],
            }
          );
        }
      }
    }
  }
  return webpackConfig;
};
