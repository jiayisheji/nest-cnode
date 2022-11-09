import { BuildExecutorSchema } from '../executors/build/schema';

export function mergeViewOptions(
  options: Omit<BuildExecutorSchema, 'viewOptions'>,
  viewOptions: Omit<BuildExecutorSchema, 'viewOptions'>
) {
  viewOptions.generatePackageJson = false;
  viewOptions.target = 'web';
  viewOptions.compiler = 'babel';
  viewOptions.deleteOutputPath = false;
  viewOptions.fileReplacements = [];
  viewOptions.assets = [];
  return Object.assign({}, options, viewOptions);
}
