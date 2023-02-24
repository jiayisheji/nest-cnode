const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
const { join } = require('path');
const { composePlugins, withNx } = require('@nrwl/webpack');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config, { options, context }) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  if (config.mode === 'production') {
    //  fix di error 禁用压缩
    if (config.optimization == null) {
      config.optimization = {};
    }
    config.optimization.minimize = false;
    // fix package.json useless dependency
    config.plugins.push(
      new GeneratePackageJsonPlugin(
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
      )
    );
  }
  return config;
});
