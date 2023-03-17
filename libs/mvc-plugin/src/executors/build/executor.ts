import { ExecutorContext } from '@nrwl/devkit';
import { combineAsyncIterables } from '@nrwl/devkit/src/utils/async-iterable';
import { webpackExecutor } from '@nrwl/webpack';
import { normalizeOptions } from '@nrwl/webpack/src/executors/webpack/lib/normalize-options';
import { mergeBrowserOptions, mergeServerOptions } from '../../utils/merge-options';
import type { BuildExecutorSchema } from './schema';

async function* buildExecutor(buildOptions: BuildExecutorSchema, context: ExecutorContext) {
  const { browserOptions: _browserOptions, ..._options } = buildOptions;
  const metadata = context.projectsConfigurations.projects[context.projectName];
  const sourceRoot = metadata.sourceRoot;
  const options = normalizeOptions(_options, context.root, metadata.root, sourceRoot);

  const serverOptions = mergeServerOptions(options);
  const browserOptions = mergeBrowserOptions(options, _browserOptions);

  const runBrowser = webpackExecutor(browserOptions, context);
  const runServer = webpackExecutor(serverOptions, context);

  let browserBuilt = false;
  let nodeStarted = false;
  const combined = combineAsyncIterables(runServer, runBrowser);

  for await (const output of combined) {
    if (!output.success) {
      throw new Error('Could not build application');
    }
    if (output.options.target === 'node') {
      nodeStarted = true;
    } else if (output.options?.target === 'web') {
      browserBuilt = true;
    }

    if (nodeStarted && browserBuilt) {
      yield output;
    }
  }
}

export default buildExecutor;
