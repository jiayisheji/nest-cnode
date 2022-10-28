/**
 * 扩展打包配置
 * @param {WebpackConfig} webpackConfig
 * @param {object} nxContext
 * @returns {WebpackConfig}
 */
module.exports = (webpackConfig, nxContext) => {
  //  fix di error 禁用压缩
  if (webpackConfig.optimization) {
    webpackConfig.optimization.minimize = false;
  }
  return webpackConfig;
};
