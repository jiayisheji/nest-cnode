import { NestExpressApplication } from '@nestjs/platform-express';
import {
  ExecutorContext,
  ProjectConfiguration,
  ProjectGraph,
  readCachedProjectGraph,
  readNxJson,
  TargetConfiguration,
  workspaceRoot,
  Workspaces,
} from '@nrwl/devkit';
import { getWebpackConfig } from '@nrwl/webpack/src/executors/webpack/lib/get-webpack-config';
import { normalizeOptions } from '@nrwl/webpack/src/executors/webpack/lib/normalize-options';
import { resolveCustomWebpackConfig } from '@nrwl/webpack/src/utils/webpack/custom-webpack';
import { readProjectsConfigurationFromProjectGraph } from 'nx/src/project-graph/project-graph';
import { combineOptionsForExecutor } from 'nx/src/utils/params';
import * as reload from 'reload';
import { Configuration, webpack } from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import { formatWebpackMessages } from './format-webpack-messages';
import { mergeViewOptions } from './merge-view-options';

/**
 * mvc webpackDevMiddleware
 * @param app NestExpressApplication
 * @param project project.json
 */
export async function mvcViewDevWebpack(app: NestExpressApplication, project: ProjectConfiguration) {
  // 获取 express 实例
  const express = app.getHttpAdapter().getInstance();
  // 创建浏览器刷新服务
  const reloadServer: { reload: () => void } = await reload(express);

  // 通过 project.json 获取 webpack config
  const webpackConfig = await getWebpackConfigForProject(project);

  // 使用webpack函数加载配置文件，生成一个webpack编译器
  const complier = webpack(webpackConfig);

  // webpack-dev-middleware 会将 complier is responsible 转换为一个中间件
  app.use(
    webpackDevMiddleware(complier, {
      publicPath: webpackConfig.output.publicPath,
      serverSideRender: true,
      writeToDisk: true, // 文件写到磁盘 必须为 true
    })
  );

  return new Promise<{ reload: () => void }>((resolve, reject) => {
    complier.hooks.done.tap('done', (stats) => {
      const rawMessages = stats.toJson({
        all: false,
        warnings: true,
        errors: true,
      });
      const messages = formatWebpackMessages(rawMessages);
      if (!messages.errors.length && !messages.warnings.length) {
        console.log('Compiled successfully!');
        reloadServer && reloadServer.reload();
        resolve(reloadServer);
      }
      if (messages.errors.length) {
        console.log('Failed to compile.');
        messages.errors.forEach((e: string) => console.log(e));
        reject(messages.errors);
        return;
      }
      if (messages.warnings.length) {
        console.log('Compiled with warnings.');
        messages.warnings.forEach((w: string) => console.log(w));
      }
    });
  });

  return reloadServer;
}

function createExecutorContext(
  graph: ProjectGraph,
  targets: Record<string, TargetConfiguration>,
  projectName: string,
  targetName: string,
  configurationName: string
): ExecutorContext {
  const projectConfigs = readProjectsConfigurationFromProjectGraph(graph);
  return {
    cwd: process.cwd(),
    projectGraph: graph,
    target: targets[targetName],
    targetName,
    configurationName,
    root: workspaceRoot,
    isVerbose: false,
    projectName,
    workspace: {
      ...readNxJson(),
      ...projectConfigs,
    },
  };
}

/**
 * 根据 project.json 获取 webpack config
 * @param project
 * @returns
 */
async function getWebpackConfigForProject(project: ProjectConfiguration): Promise<Configuration> {
  // 指明 build target
  const target = 'build';
  // 获取 build target config
  const targetConfig = project.targets[target];
  // 异常处理
  if (!targetConfig) {
    throw new Error(`Cannot find target '${target}' for project '${project}'`);
  }

  // 获取 ExecutorContext
  const context = createExecutorContext(readCachedProjectGraph(), project.targets, project.name, target, undefined);

  // Workspaces 读取类
  const ws = new Workspaces(context.root);
  // 读取 executor 参数解析 模块和执行器
  const [nodeModule, executor] = targetConfig.executor.split(':');
  // 获取 executors/build/schema.json
  const { schema } = ws.readExecutor(nodeModule, executor);

  // 获取当前 configuration，这里读取不到 `defaultConfiguration` 值
  const configuration = targetConfig.defaultConfiguration;

  // 读取 build.options 配置
  const { viewOptions, ..._options } = targetConfig.options;
  // 跟 executors/build/executor.ts 配置一样
  // viewOptions.generatePackageJson = false;
  // viewOptions.target = 'web';
  // viewOptions.compiler = 'babel';
  // viewOptions.deleteOutputPath = false;
  // viewOptions.fileReplacements = [];
  targetConfig.options = mergeViewOptions(_options, viewOptions);
  // 根据 schema 生成 options
  const combinedOptions = combineOptionsForExecutor(
    {},
    configuration,
    targetConfig,
    schema,
    context.projectName,
    ws.relativeCwd(context.cwd),
    context.isVerbose
  );
  // 这是 webpackExecutor 处理 options
  const options = normalizeOptions(combinedOptions, context.root, project.sourceRoot);
  // 下面都是 getWebpackConfigs 简化代码
  const isScriptOptimizeOn =
    typeof options.optimization === 'boolean'
      ? options.optimization
      : options.optimization && options.optimization.scripts
      ? options.optimization.scripts
      : false;

  let customWebpack = null;

  // 处理 webpackConfig 自定义配置
  if (options.webpackConfig) {
    customWebpack = resolveCustomWebpackConfig(options.webpackConfig, options.tsConfig);

    if (typeof customWebpack.then === 'function') {
      customWebpack = await customWebpack;
    }
  }

  return await Promise.resolve(getWebpackConfig(context, options, true, isScriptOptimizeOn)).then(async (config) => {
    if (customWebpack) {
      return await customWebpack(config, {
        options,
        context,
        configuration: context.configurationName,
      });
    } else {
      return config;
    }
  });
}
