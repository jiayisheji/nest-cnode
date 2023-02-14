import { ExecutorContext } from '@nrwl/devkit';
import { webpackExecutor } from '@nrwl/webpack';
import { mergeViewOptions } from '../../utils/merge-view-options';
import { BuildExecutorSchema } from './schema';

export default async function* runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
  const { viewOptions, ..._options } = options;
  _options.watch = false;
  try {
    for await (const output of webpackExecutor(_options, context)) {
      if (!output.success) {
        throw new Error('Could not compile application files');
      }
    }

    for await (const output of webpackExecutor(mergeViewOptions(_options, viewOptions), context)) {
      if (!output.success) {
        throw new Error('Could not compile application views files');
      }
    }
  } catch (error) {
    yield {
      success: false,
    };
  }
  yield { success: true };
}
