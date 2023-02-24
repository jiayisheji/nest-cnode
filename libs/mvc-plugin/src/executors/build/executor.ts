import { ExecutorContext, logger } from '@nrwl/devkit';
import { eachValueFrom } from '@nrwl/devkit/src/utils/rxjs-for-await';
import { normalizeOptions } from '@nrwl/webpack/src/executors/webpack/lib/normalize-options';
import { runWebpack } from '@nrwl/webpack/src/executors/webpack/lib/run-webpack';
import { deleteOutputDir } from '@nrwl/webpack/src/utils/fs';
import { calculateProjectDependencies, createTmpTsConfig } from '@nrwl/workspace/src/utilities/buildable-libs-utils';
import { resolve } from 'path';
import { from, Observable, of } from 'rxjs';
import { bufferCount, mergeMap, mergeScan, switchMap, tap } from 'rxjs/operators';
import { Configuration, Stats } from 'webpack';
import { getWebpackConfig } from '../../utils/get-webpack-config';
import { mergeViewOptions } from '../../utils/merge-view-options';
import type { BuildExecutorSchema } from './schema';

async function* buildExecutor(buildOptions: BuildExecutorSchema, context: ExecutorContext) {
  const metadata = context.projectsConfigurations.projects[context.projectName];
  const { viewOptions: _viewOptions, ..._options } = buildOptions;
  const sourceRoot = metadata.sourceRoot;
  const options = normalizeOptions(_options, context.root, metadata.root, sourceRoot);
  const isScriptOptimizeOn =
    typeof options.optimization === 'boolean'
      ? options.optimization
      : options.optimization && options.optimization.scripts
      ? options.optimization.scripts
      : false;

  process.env.NODE_ENV ||= isScriptOptimizeOn ? 'production' : 'development';

  if (options.compiler === 'swc') {
    try {
      require.resolve('swc-loader');
      require.resolve('@swc/core');
    } catch {
      logger.error(`Missing SWC dependencies: @swc/core, swc-loader. Make sure you install them first.`);
      return {
        success: false,
        outfile: resolve(context.root, options.outputPath, options.outputFileName),
        options,
      };
    }
  }

  if (!options.buildLibsFromSource && context.targetName) {
    const { dependencies } = calculateProjectDependencies(
      context.projectGraph,
      context.root,
      context.projectName,
      context.targetName,
      context.configurationName
    );
    options.tsConfig = createTmpTsConfig(options.tsConfig, context.root, metadata.root, dependencies);
  }

  // Delete output path before bundling
  if (options.deleteOutputPath) {
    deleteOutputDir(context.root, options.outputPath);
  }

  const configs: Configuration[] = (
    await Promise.all([
      getWebpackConfig(options, context),
      getWebpackConfig(mergeViewOptions(options, _viewOptions), context, true),
    ])
  ).flat(1);

  return yield* eachValueFrom(
    of(configs).pipe(
      mergeMap((config) => (Array.isArray(config) ? from(config) : of(config))),
      // Run build sequentially and bail when first one fails.
      mergeScan(
        (acc, config): Observable<Stats> => {
          if (!acc.hasErrors()) {
            return runWebpack(config).pipe<Stats>(
              tap((stats: Stats) => {
                console.info(stats.toString(config.stats));
              }) as any
            ) as unknown as Observable<Stats>;
          } else {
            return of();
          }
        },
        { hasErrors: () => false } as Stats,
        1
      ),
      // Collect build results as an array.
      bufferCount(Array.isArray(configs) ? configs.length : 1),
      switchMap(async (results) => {
        const success = results.every((result) => Boolean(result) && !result.hasErrors());
        return {
          success,
          outfile: resolve(context.root, options.outputPath, options.outputFileName),
          options,
        };
      })
    )
  );
}

export default buildExecutor;
