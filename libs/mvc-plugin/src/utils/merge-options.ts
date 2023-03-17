import { NormalizedWebpackExecutorOptions } from '@nrwl/webpack';
import { BuildExecutorSchema } from '../executors/build/schema';

export function mergeServerOptions(
  options: NormalizedWebpackExecutorOptions,
  serverOptions?: Omit<BuildExecutorSchema, 'serverOptions' | 'browserOptions'>
): NormalizedWebpackExecutorOptions {
  const defaultOptions = {
    target: 'node',
  };
  return Object.assign({}, options, Object.assign(defaultOptions, serverOptions));
}

export function mergeBrowserOptions(
  options: NormalizedWebpackExecutorOptions,
  browserOptions?: Omit<BuildExecutorSchema, 'browserOptions' | 'serverOptions'>
): NormalizedWebpackExecutorOptions {
  const defaultOptions = {
    generatePackageJson: false,
    target: 'web',
    compiler: 'babel',
    deleteOutputPath: false,
    styles: [],
    scripts: [],
  };

  return Object.assign({}, options, Object.assign(defaultOptions, browserOptions));
}
