import { ExecutorContext, parseTargetString, Workspaces } from '@nrwl/devkit';
import { combineOptionsForExecutor } from 'nx/src/utils/params';

export function getOptionsForExecutor(options: { buildTarget: string }, context: ExecutorContext) {
  const buildTarget = parseTargetString(options.buildTarget, context.projectGraph);
  const metadata = context.projectsConfigurations.projects[buildTarget.project];
  const targetConfig = metadata.targets[buildTarget.target];
  // Workspaces 读取类
  const ws = new Workspaces(metadata.root);
  // 读取 executor 参数解析 模块和执行器
  const [nodeModule, executor] = targetConfig.executor.split(':');
  // 获取 executors/build/schema.json
  const { schema } = ws.readExecutor(nodeModule, executor);

  // 获取当前 configuration，这里读取不到 `defaultConfiguration` 值
  const configuration = targetConfig.defaultConfiguration;

  // 读取 build.options 配置
  const { viewOptions, ..._options } = targetConfig.options;
  // 根据 schema 生成 options
  return combineOptionsForExecutor(
    _options,
    configuration,
    targetConfig,
    schema,
    context.projectName,
    ws.relativeCwd(context.cwd),
    context.isVerbose
  );
}
