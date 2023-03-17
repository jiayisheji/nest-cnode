import { ExecutorContext, parseTargetString, readTargetOptions } from '@nrwl/devkit';
import { combineAsyncIterables } from '@nrwl/devkit/src/utils/async-iterable';
import { nodeExecutor } from '@nrwl/js/src/executors/node/node.impl';
import { NormalizedWebpackExecutorOptions, webpackExecutor, WebpackExecutorOptions } from '@nrwl/webpack';
import { mergeBrowserOptions } from '../../utils/merge-options';
import type { ServeExecutorSchema } from './schema';

async function* serveExecutor(buildOptions: ServeExecutorSchema, context: ExecutorContext) {
  const { buildTargetBrowserOptions: _browserOptions, ...options } = buildOptions;
  const buildTarget = parseTargetString(options.buildTarget, context.projectGraph);
  const { browserOptions, ...normalizedOptions } = readTargetOptions<
    NormalizedWebpackExecutorOptions & { browserOptions: WebpackExecutorOptions }
  >(buildTarget, context);

  const runBrowser = webpackExecutor(
    mergeBrowserOptions(normalizedOptions, Object.assign(browserOptions, _browserOptions)),
    context
  );

  const runServer = nodeExecutor(options, context);

  let browserBuilt = false;
  let nodeStarted = false;
  const combined = combineAsyncIterables(runBrowser, runServer);

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

export default serveExecutor;
