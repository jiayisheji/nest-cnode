import { NestExpressApplication } from '@nestjs/platform-express';
import {
  ExecutorContext,
  ProjectConfiguration,
  ProjectGraph,
  readCachedProjectGraph,
  readNxJson,
  TargetConfiguration,
  workspaceRoot,
} from '@nrwl/devkit';
import { normalizeOptions } from '@nrwl/webpack/src/executors/webpack/lib/normalize-options';
import { readProjectsConfigurationFromProjectGraph } from 'nx/src/project-graph/project-graph';
import { Configuration, webpack } from 'webpack';
import { getOptionsForExecutor } from './combined-options';
import { formatWebpackMessages } from './format-webpack-messages';
import { getWebpackConfig } from './get-webpack-config';
import { mergeViewOptions } from './merge-view-options';
import reload = require('reload');
import webpackDevMiddleware = require('webpack-dev-middleware');

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
  const webpackConfig = (await getWebpackConfigForProject(project)) as Configuration;

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
      console.info(stats.toString(webpackConfig.stats));
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
}

function createExecutorContext(
  graph: ProjectGraph,
  targets: Record<string, TargetConfiguration>,
  projectName: string,
  targetName: string,
  configurationName: string
): ExecutorContext {
  const nxJsonConfiguration = readNxJson();
  const projectsConfigurations = readProjectsConfigurationFromProjectGraph(graph);
  return {
    cwd: process.cwd(),
    projectGraph: graph,
    target: targets[targetName],
    targetName,
    configurationName,
    root: workspaceRoot,
    isVerbose: false,
    projectName,
    projectsConfigurations,
    nxJsonConfiguration,
    workspace: {
      ...projectsConfigurations,
      ...nxJsonConfiguration,
    },
  };
}

/**
 * 根据 project.json 获取 webpack config
 * @param project
 * @returns
 */
async function getWebpackConfigForProject(project: ProjectConfiguration) {
  // 获取 ExecutorContext
  const context = createExecutorContext(readCachedProjectGraph(), project.targets, project.name, 'build', undefined);

  const { buildTarget, buildTargetViewOptions } = project.targets['serve'].options;

  const { viewOptions, ...combinedOptions } = getOptionsForExecutor({ buildTarget }, context);
  const metadata = context.projectsConfigurations.projects[project.name];
  // 这是 webpackExecutor 处理 options
  const options = normalizeOptions(
    mergeViewOptions(combinedOptions, { ...viewOptions, ...buildTargetViewOptions }),
    context.root,
    metadata.root,
    project.sourceRoot
  );
  // 跟 executors/build/executor.ts 配置一样
  return getWebpackConfig(options, context, true);
}
