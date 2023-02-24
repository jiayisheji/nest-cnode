import { ExecutorContext } from '@nrwl/devkit';
import { composePluginsSync, NormalizedWebpackExecutorOptions, withNx, withWeb } from '@nrwl/webpack';
import { resolveCustomWebpackConfig } from '@nrwl/webpack/src/utils/webpack/custom-webpack';
import { Configuration } from 'webpack';

export async function getWebpackConfig(
  options: NormalizedWebpackExecutorOptions,
  context: ExecutorContext,
  view?: boolean
): Promise<Configuration | ReadonlyArray<Configuration>> {
  if (options.isolatedConfig && !options.webpackConfig) {
    throw new Error(
      `Using "isolatedConfig" without a "webpackConfig" is not supported${view ? ' for viewOptions' : ''}.`
    );
  }

  let customWebpack = null;

  if (options.webpackConfig) {
    customWebpack = resolveCustomWebpackConfig(options.webpackConfig, options.tsConfig);

    if (typeof customWebpack.then === 'function') {
      customWebpack = await customWebpack;
    }
  }

  const config = options.isolatedConfig
    ? {}
    : ((options, context) => {
        const config: Configuration = {};
        const configure = options.target === 'node' ? withNx() : composePluginsSync(withNx(), withWeb());
        return configure(config, { options, context });
      })(options, context);

  if (customWebpack) {
    return await customWebpack(config, {
      options,
      context,
      configuration: context.configurationName, // backwards compat
    });
  } else {
    // If the user has no webpackConfig specified then we always have to apply
    return config;
  }
}
