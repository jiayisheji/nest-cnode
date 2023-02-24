import { NormalizedWebpackExecutorOptions } from '@nrwl/webpack';
import { BuildExecutorSchema } from '../executors/build/schema';

export function mergeViewOptions(
  options: NormalizedWebpackExecutorOptions,
  viewOptions: Omit<BuildExecutorSchema, 'viewOptions'>
): NormalizedWebpackExecutorOptions {
  viewOptions.generatePackageJson = false;
  viewOptions.target = 'web';
  viewOptions.compiler = 'babel';
  viewOptions.deleteOutputPath = false;
  viewOptions.assets = [];
  viewOptions['skipTypeChecking'] = true;
  return Object.assign({}, options, viewOptions);
}
