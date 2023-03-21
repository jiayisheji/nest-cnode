# Nx 定制本地插件

[Nx](https://nx.dev/) 是一个构建系统与一流的 monorepo 支持和强大的集成的工具，这个主要依托就是 [Plugins](https://nx.dev/community#plugin-directory)。

在说 `Plugins` 我们先说一下 `Nx` 为什么依靠各种插件都能快速集成扩展

## Nx 架构

Nx 在 [v8](https://github.com/nrwl/nx/tree/8.0.0) 及以前一直是 [Angular](https://github.com/angular/angular) 扩展工具存在，并且主要围绕 [Angular Cli](https://github.com/angular/angular-cli) 增强。配置文件也是使用 `angular.json` 配置

```text
Nrwl Extensions for Angular (Nx)
Nx is a set of Angular CLI power-ups for modern development.
```

[v9](https://github.com/nrwl/nx/tree/9.0.0) 开始以 `Monorepo Tool` 为扩展工具，支持 [React](https://github.com/facebook/react)。配置文件由 `angular.json` 变成 `workspace.json`，以及变成独立的 `project.json`。

```text
Extensible Dev Tools for Monorepos.
```

`Angular` 从 `v6` 开始支持 `Monorepos` 风格工作区。`Angular` 痛点都被 `Nx` 抹平：

- `angular.json` 多个项目以后会变得异常大，`Nx` 采用 `workspace.json` 映射路径 + `project.json` 独立配置
- `angular.json` 所有的项目都存在 `projects` 文件夹里，无法区分 `projectType`(`application`、`library`)，`Nx` 采用 `apps`、`libs` 两个文件夹存放
- `angular.json` 特定不变工具，比如单元测试 `Karma`，`Nx` 采用 `Jest`，可用通过插件自己扩展喜欢第三方工具。
- `angular.json` 扩展不是很容易，`Nx` 使扩展变得容易，核心就是我们要说插件。

主要通过 `project.json` 介绍架构：

- name: 项目名
- $schema：[json-schema](http://json-schema.org/) 验证器
- sourceRoot 源码路径 `apps/project/src`
- projectType 项目类型：`application` 和 `library`
- targets 构建目标集（重点）包含: `executor` 和 `options` 及 `configurations`
- tags: nx-cli 一些相关扩展功能，配合 `eslint` 的 `rules` 来约束包引用

构建目标

来源 `angular.json` 默认有:

- `application`: `build`、`serve`、`test`、`lint`、`extract-i18n`
- `e2e`: `e2e`、`lint`
- `library`: `build`、`test`、`lint`

> 其中 `e2e` 依赖对应 `application` 的 `serve` 命令

每个独立构建目标：

- builder：构建生成器
- options：构建可选参数
- configurations：构建执行配置参数，默认配置 `production` 和 `development`。可用根据需要自己配置，使用 `--configuration=production`

> configurations 会覆盖 options 同名配置。

在实际使用 `ng run project:target[:configuration]`

`builder` 构建生成器执行器，如果在 Angular 14 切换成 `esBuild`, 只需要改一行代码：

```json
"build": {
  // "builder": "@angular-devkit/build-angular:browser"
  "builder": "@angular-devkit/build-angular:browser-esbuild"
}
```

根据[官方文档](http://angular.io/guide/cli-builder)介绍：

1. 创建构建器

```ts
import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';

interface Options extends JsonObject {}

export default createBuilder(myBuilder);

async function myBuilder(options: Options, context: BuilderContext): Promise<BuilderOutput> {
  try {
    // code
  } catch (err) {
    // 运行失败
    return {
      success: false,
      error: err.message,
    };
  }
  // 运行成功
  return { success: true };
}
```

2. 创建构建器的输入

在整个 `Angular` 里都是使用 `json-schema` 验证输入参数

需要创建 `schema.json`

```json
{
  "$schema": "http://json-schema.org/schema",
  "type": "object",
  "properties": {
    ...
  }
}
```

3. 构建器映射

需要创建 `builders.json`

```json
{
  "builders": {
    "my": {
      "implementation": "./dist/my-builder.js",
      "schema": "./src/schema.json",
      "description": "my builder"
    }
  }
}
```

> 可用创建多个，使用就是 `xxx:my`。

4. 发布 npm

在 `package.json` 里添加 `"builders": "builders.json"` 即可。

5. 安装

```bash
npm install myBuilder --save-dev
```

6. 配置

在 `angular.json` 里面项目下 `architect`

```json
{
  "architect": {
    "my": {
      "builder": "myBuilder:my",
      "options": {}
    }
  }
}
```

7. 使用

```bash
npm run project:my
```

> 看起来是不是很简单，最关键的是第一步创建构建器。

`Angular` 自带扩展：

- builders 构建器，使用 `ng run project:target[:configuration]`
- schematic 生成器，使用 `ng generate schematic:name [:options]`
- migrations 迁移器，借助 `ng update` 运行升级，需要包提供 `ng-update` 才会升级

> 这三个东西都是非常好用，接下来我们要说 Nx Plugin 就是它们的增强

`Nx Plugin`：

- executors：执行器，使用 `nx run project:target[:configuration]`
- generators：生成器，使用 `nx generate schematic:name [:options]`
- migrations：迁移器，借助 `nx migrate` 运行升级，需要包提供 `nx-migrations` 才会升级

## Nx Plugin

### 插件列表

```bash
npx nx list

# Local workspace plugins: 本地安装插件（不需要发布 npm，也不需要 build，直接引用，这个相比 Angular-cli 方便许多）
# Installed plugins: 已经安装的插件插件
# Also available: 未安装内置插件
# Community plugins: 社区插件
```

社区有很多优秀的插件，比如 `Nx` 一直没有支持 `Vue2`，官方计划 `v16` 考虑集成 `Vue3`，就有热心网友写了插件 `@nx-plus/vue` 支持。

### 创建本地插件

以前本地只支持 `executors` 和 `generators`。自动生成在 `tools` 目录里。

```bash
npx nx generate @nrwl/workspace:workspace-generator generatorName --no-interactive
```

可用使用 `Nx` 命令生成 `generators`，`executors` 没有，以前文档有专门一篇介绍 `custom executors`。改版以后就没有，现在可用使用 [Local Generators](https://nx.dev/recipes/generators/local-generators)。

安装插件包：

```bash
npm install @nrwl/nx-plugin@latest
```

创建插件

```bash
npx nx generate @nrwl/nx-plugin:plugin mvc-plugin
```

会帮我们自动生成：

- executors
- generators

可用之间在 `project.json` 的 `executor` 直接使用 `@nest-cnode/mvc-plugin:build`

`executors` 给我们配置一个 `build`，打印 `options` 参数的执行器函数 `runExecutor`。

`generators` 给我们配置一个库生成器，里面包括模板文件生成，默认使用 `@nest-cnode/mvc-plugin:build` 命令。

### mvc-plugin

在 [client 项目初始化](03.client项目初始化.md) 介绍了，`views` 要使用 `webpack` 单独处理。

从零开始写一个 `executors` 不太现实，借助 `Nx` 提供方法，我们可用有 2 个思路：

- 使用 `runExecutor` 方法可用执行当前项目已有的 `target`
- 执行已有的 `executors` 函数（默认是一个 [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)），传递所需参数即可及处理自己代码。

这里要说一个一坑，在 `serve` 里面的配置有个

```json
"serve": {
  "executor": "@nrwl/js:node",
  "options": {
    "buildTarget": "client:build",
    "buildTargetOptions": {} // 定义要传递的参数，会覆盖 build.options
  },
}
```

在 `"@nrwl/js:node"` 内部就是使用 `runExecutor` 执行 `build` 的 `@nrwl/webpack:webpack`。换句简单理解我们也可以借助这种实现方式实现我们想要功能。

#### 借助 runExecutor 实现

1. 创建一个 `target`，我们叫它 `base-build`, 把之前 `build` 配置都复制过来

2. 把之前 `build` 改成：

```json
{
  "build": {
    "executor": "@nest-cnode/mvc-plugin:build",
    "options": {
      "buildTarget": "client:base-build",
      ... // 传递自己的配置
    },
    "configurations": {
      "production": {
        "buildTarget": "client:base-build:production"
      }
    }
  }
}
```

3. 把 `serve` 的 `buildTarget` 的 `client:build` 改成 `client:base-build`

```json
{
  "serve": {
    "executor": "@nrwl/js:node",
    "options": {
      "buildTarget": "client:base-build"
    },
    "configurations": {
      "production": {
        "buildTarget": "client:base-build:production"
      }
    }
  }
}
```

4. 书写自己的 `executor` 执行器 `executors/build/executor.ts`

```ts
import { ExecutorContext, runExecutor as NxRunExecutor, parseTargetString } from '@nrwl/devkit';
/**
 * 执行器主函数
 * @param options 配置参数 target.options，如果配置有 configurations，会根据 configuration 自动合并
 * @param context 执行器上下文 主要全局配置
 */
export default async function* runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
  const { project, target, configuration } = parseTargetString(options.buildTarget);
  // 1. 处理 nestjs 打包
  for await (const output of await NxRunExecutor<{ success: boolean }>(
    { project, target, configuration },
    {},
    context
  )) {
    if (!output.success) {
      throw new Error('Could not compile application files');
    }
  }

  // 2. 处理 views 打包

  return {
    success: true,
  };
}
```

第一步比较简单，就实现 `nestjs` 打包。

第二个就比较麻烦，需要你自己配置 [webpack](https://webpack.js.org/configuration/)。

如果你对 `webpack` 不是很熟练，给你推荐一个 [create-react-app](https://github.com/facebook/create-react-app/blob/main/packages/react-scripts/config/webpack.config.js#L100) 的配置。直接照着复制代码，改成你想要就行了。

依旧使用它的 [build](https://github.com/facebook/create-react-app/blob/main/packages/react-scripts/scripts/build.js#L146) 脚本放到 `2. 处理 views 打包` 即可。

还需要有 2 个脚本支持

配置 `webpack.entry`，打包 `js`。

```js
const sourceRoot = 'app/client/src';
const viewsPath = 'views';

function getEntry() {
  const pattern = `${sourceRoot}/${viewsPath}/**/*.main.js`;
  const match = new RegExp(pattern.replace('**', '(.*)').replace('*.main', '(.*).main'));
  const entry = {};
  for (const filepath of glob.sync(pattern)) {
    const result = filepath.match(match);
    if (result) {
      const [, folder, filename] = result;
      if (folder === filename) {
        entry[filename] = filepath.replace(sourceRoot, './src');
      } else {
        entry[folder.split('/').concat(filename).join('_')] = filepath.replace(sourceRoot, './src');
      }
    }
  }
  return entry;
}
```

获取模板，配置 `HtmlWebpackPlugin`

- `.template.hbs` 表示页面模板
- `/partials/*.hbs` 表示局部模板
- `layout.hbs` 表示布局模板

```js
function getHtml() {
  const pattern = `${sourceRoot}/${viewsPath}/**/*.hbs`;
  const match = new RegExp(pattern.replace('**', '(.*)?').replace('*.hbs', '(.*).hbs'));
  const fileMatch = new RegExp(pattern.replace('**/*.hbs', '(.*).hbs'));
  const options = [];
  for (const filepath of glob.sync(pattern)) {
    const result = filepath.match(match);
    if (result) {
      const [, folder, filename] = result;
      const template = filename.replace('.template', '');
      const entry = folder === template ? folder : folder.split('/').concat(template).join('_');
      options.push({
        template: filepath.replace(sourceRoot, './src'),
        filename: `${viewsPath}/${folder}/${template}.hbs`,
        chunks: filename.endsWith('.template') && !folder.endsWith('/partials') && [entry],
        inject: false,
      });
    } else {
      // `layout.hbs` 才会执行这里
      options.push({
        template: filepath.replace(sourceRoot, './src'),
        filename: `${viewsPath}/${filepath.replace(fileMatch, '$1')}.hbs`,
        inject: false,
      });
    }
  }
  return options;
}
```

> 对于 webpack 配置，还有另外一种方式借助 Nx 的 [webpack](https://github.com/nrwl/nx/tree/master/packages/webpack) 实现。

#### 独立 executors 实现

主要借助 `webpackExecutor` 实现，先上代码：

```ts
import { ExecutorContext } from '@nrwl/devkit';
import { webpackExecutor } from '@nrwl/webpack';
import { BuildExecutorSchema } from './schema';

export default async function* runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
  const { viewOptions, ..._options } = options;

  if (options.watch) {
    yield* webpackExecutor(_options, context);
  } else {
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
}
```

接下来就讲解代码：

获取 [schema.json](https://github.com/nrwl/nx/blob/master/packages/webpack/src/executors/webpack/schema.json)，把 `properties` 替换到本地的 `schema.json`。
并且在后面添加：

```json
"viewOptions": {
  "type": "object",
  "description": "Additional options to pass into the build target.",
  "default": {}
}
```

> 这个属性必须要添加，不然在 `schema` 验证会出现错误。这个属性作用是什么，它主要是为了覆盖 `options` 配置。

我翻看了 `@nrwl/webpack` 的源码，这个包处理 `webpack.target` 是 `node` 和 `web`（会生成 2 套 js（es5 和 es6））。

它里面有一套完整的 `webpack` 配置生成方式，还可以合并自定义配置。所有我思来想去，就像借助这个特性，只需要 `viewOptions` 覆盖 `options`，只定义一个 `view-webpack.config.js`。可用去覆盖我想要的配置，比如 `entry` 和 `HtmlWebpackPlugin`。

你可能会发现里面有个 `if(options.watch)` 这个是几个意思。这个是来源 `Nx` 本身的一个坑。

`serve` 默认就是执行的 `build`，只是通过 `buildTargetOptions` 覆盖 `build` 的 `options`。如果有多个 `webpackExecutor` 执行会导致 `nestjs` 不会启动。还有更致命问题没有办法让 `nestjs` 和 `webpack` 交互。

实际写一个 `executors` 很容易，`@nrwl/devkit` 里提供各种好用的工具，还可以借助已有内置 `executors` 实现想要功能。如果不能实现也可以参考代码，修改成自己的想要的功能。

接下来就是实现 `nestjs` 和 `webpack` 交互中间件 `mvcViewDevWebpack`。

```ts
/**
 * mvc webpackDevMiddleware
 * @param app NestExpressApplication
 * @param project project.json
 */
export async function mvcViewDevWebpack(app: NestExpressApplication, project: ProjectConfiguration) {
  // 获取 express 实例
  const express = app.getHttpAdapter().getInstance();
  // 创建浏览器刷新服务
  const reloadServer = await reload(express);

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

  complier.hooks.done.tap('done', (stats) => {
    const rawMessages = stats.toJson({
      all: false,
      warnings: true,
      errors: true,
    });
    const messages = formatWebpackMessages(rawMessages);
    if (!messages.errors.length && !messages.warnings.length) {
      console.log('Compiled successfully!');
      reloadServer.reload();
    }
    if (messages.errors.length) {
      console.log('Failed to compile.');
      messages.errors.forEach((e: string) => console.log(e));
      return;
    }
    if (messages.warnings.length) {
      console.log('Compiled with warnings.');
      messages.warnings.forEach((w: string) => console.log(w));
    }
  });
}
```

代码里面都有注释，这里就不在说明。简单理解就是 `webpack` 编译后，会通知浏览器刷新。`nestjs` 代码修改了，会重启 `webpack`。

重点就是 `getWebpackConfigForProject` 参考 `webpackExecutor` 里实现使用 `getWebpackConfigs` 来获取 `webpack` 配置。

这个方法是私有方法，只能参照它的代码简化后实现：

```ts
async function getWebpackConfigs(
  options: NormalizedWebpackExecutorOptions,
  context: ExecutorContext
): Promise<Configuration> {}
```

`options` 和 `context` 就是 `executors` 的 2 个参数，如果在 `executors` 里很容易获取，但是在就很难获取。

正在我茫然时候，通过 `sourcegraph` 插件全局搜索 `ExecutorContext`，居然发现一个函数 [createExecutorContext](https://github.com/nrwl/nx/blob/master/packages/cypress/plugins/cypress-preset.ts#L112)。

```ts
export function createExecutorContext(
  graph: ProjectGraph,
  targets: Record<string, TargetConfiguration>,
  projectName: string,
  targetName: string,
  configurationName: string
): ExecutorContext {}
```

这里除了 `graph` 参数其他都可用在 `project.json` 得到，在搜索 `createExecutorContext` 使用后，在一堆提供测试方法找到：

```ts
import { readCachedProjectGraph } from '@nrwl/devkit';

graph = readCachedProjectGraph();
```

有 `context` 接下来就要解决 `options`。你可能要说 `project.json` 里不是有吗，确实有，它只是一部分而已。

实际 `executors` 的 `options` 是经过处理的，它经过 `schema.json` 验证和赋值，拿到最终的 `options`。

只有靠 `sourcegraph` 搜索，一开始不知道搜索什么，突然想到 [runExecutor](https://github.com/nrwl/nx/blob/master/packages/nx/src/command-line/run.ts#L250) 是怎么实现的了，它主要依赖 `runExecutorInternal()` 实现。

```ts
import { createExecutorContext } from '@nrwl/cypress/plugins/cypress-preset';
import { ExecutorContext, ProjectConfiguration, readCachedProjectGraph, Workspaces } from '@nrwl/devkit';
import { getWebpackConfig } from '@nrwl/webpack/src/executors/webpack/lib/get-webpack-config';
import { combineOptionsForExecutor } from 'nx/src/utils/params';
import { normalizeOptions } from '@nrwl/webpack/src/executors/webpack/lib/normalize-options';
import { resolveCustomWebpackConfig } from '@nrwl/webpack/src/utils/webpack/custom-webpack';

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
```

通过 `getWebpackConfigForProject` 函数就拿到 `webpack config`。

我们来对比一下两种实现的 `project.json`：

1. 借助 `runExecutor` 实现

```json
{
  "base-build": {
    "executor": "@nrwl/webpack:webpack",
    "outputs": ["{options.outputPath}"],
    "options": {
      "target": "node",
      "compiler": "tsc",
      "outputPath": "dist/apps/client",
      "main": "apps/client/src/main.ts",
      "tsConfig": "apps/client/tsconfig.app.json",
      "assets": ["apps/client/src/assets"],
      "webpackConfig": "apps/client/webpack.config.js",
      "generatePackageJson": true,
      "externalDependencies": "all"
    },
    "configurations": {
      "production": {
        "optimization": true,
        "extractLicenses": false,
        "inspect": false,
        "fileReplacements": [
          {
            "replace": "apps/client/src/environments/environment.ts",
            "with": "apps/client/src/environments/environment.prod.ts"
          }
        ]
      }
    }
  },
  "build": {
    "executor": "@nest-cnode/mvc-plugin:build",
    "options": {
      "buildTarget": "client:base-build",
      "webpackConfig": "apps/client/webpack/views-build-webpack.config.js"
    },
    "configurations": {
      "production": {
        "buildTarget": "client:base-build:production"
      }
    }
  },
  "serve": {
    "executor": "@nrwl/js:node",
    "options": {
      "buildTarget": "client:base-build",
      "buildTargetOptions": {}
    },
    "configurations": {
      "production": {
        "buildTarget": "client:base-build:production"
      }
    }
  }
}
```

2. 独立 `executors` 实现

```json
{
  "build": {
    "executor": "@nest-cnode/mvc-plugin:build",
    "outputs": ["{options.outputPath}"],
    "options": {
      "target": "node",
      "compiler": "tsc",
      "outputPath": "dist/apps/client",
      "main": "apps/client/src/main.ts",
      "tsConfig": "apps/client/tsconfig.app.json",
      "assets": ["apps/client/src/assets"],
      "webpackConfig": "apps/client/webpack.config.js",
      "generatePackageJson": true,
      "stylePreprocessorOptions": {
        "includePaths": ["apps/client/src/views/shared/styles"]
      },
      "viewOptions": {
        "webpackConfig": "apps/client/view-webpack.config.js"
      }
    },
    "configurations": {
      "production": {
        "optimization": true,
        "extractLicenses": false,
        "inspect": false,
        "main": "apps/client/src/main.prod.ts",
        "fileReplacements": [
          {
            "replace": "apps/client/src/environments/environment.ts",
            "with": "apps/client/src/environments/environment.prod.ts"
          }
        ],
        "viewOptions": {
          "outputHashing": "all",
          "webpackConfig": "apps/client/view-webpack.config.js",
          "sourceMap": false
        }
      }
    }
  },
  "serve": {
    "executor": "@nrwl/js:node",
    "options": {
      "buildTarget": "client:build",
      "buildTargetOptions": {}
    },
    "configurations": {
      "production": {
        "buildTarget": "client:build:production"
      }
    }
  }
}
```

两种实际配置参数相差不多，第二种更灵活。

### views 生成器

生成器是一个很重要的功能，也是一个提高效率，规范化操作工具。

```bash
npx nx generate @nest-cnode/mvc-plugin:mvc-view home --project=client --no-interactive --dry-run

# Generating @nest-cnode/mvc-plugin:mvc-view
# CREATE apps/client/src/views/home/home.main.js
# CREATE apps/client/src/views/home/home.module.scss
# CREATE apps/client/src/views/home/home.template.hbs
```

使用 [Nx Console](https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console) 来 `generate`，有交互式界面简单方便。

`--dry-run` 参数，只是生成文件，没有实际写入磁盘。你可以理解 `--dry-run` 写入到内存中。

#### 虚拟文件系统树

与 `Angular-cli` 同源，有一颗虚拟文件系统树 [Tree](https://github.com/nrwl/nx/blob/master/packages/nx/src/generators/tree.ts)。可以在内存里操作也可以读写磁盘，这样很方便跨平台使用，比如单元测试。

```ts
/**
 * Virtual file system tree.
 */
export interface Tree {
  /**
   * Root of the workspace. All paths are relative to this.
   */
  root: string;

  /**
   * Read the contents of a file.
   * @param filePath A path to a file.
   */
  read(filePath: string): Buffer | null;

  /**
   * Read the contents of a file as string.
   * @param filePath A path to a file.
   * @param encoding the encoding for the result
   */
  read(filePath: string, encoding: BufferEncoding): string | null;

  /**
   * Update the contents of a file or create a new file.
   */
  write(filePath: string, content: Buffer | string, options?: TreeWriteOptions): void;

  /**
   * Check if a file exists.
   */
  exists(filePath: string): boolean;

  /**
   * Delete the file.
   */
  delete(filePath: string): void;

  /**
   * Rename the file or the folder.
   */
  rename(from: string, to: string): void;

  /**
   * Check if this is a file or not.
   */
  isFile(filePath: string): boolean;

  /**
   * Returns the list of children of a folder.
   */
  children(dirPath: string): string[];

  /**
   * Returns the list of currently recorded changes.
   */
  listChanges(): FileChange[];

  /**
   * Changes permissions of a file.
   * @param filePath A path to a file.
   * @param mode The permission to be granted on the file, given as a string (e.g `755`) or octal integer (e.g `0o755`).
   * See https://nodejs.org/api/fs.html#fs_file_modes.
   */
  changePermissions(filePath: string, mode: Mode): void;
}
```

虚拟文件系统树抽象常用方法，方便使用。

#### 生成器默认模板

主要使用 `generateFiles` 生成模板

```ts
generateFiles(tree: Tree, srcFolder: string, target: string, substitutions: {
    [k: string]: any;
}): void
```

创建 `files` 存放模板文件夹

创建要生成的文件，如果文件名要动态 `__filename__.js__template__`，其中 `filename` 和 `template` 都是要传递给 `substitutions` 变量，其中 `template` 需要空字符，这个主要是为了文件不被其他文件后缀格式化处理。模板里使用 [ejs](https://ejs.co/) 语法。如果想要任何函数，变量都需要 `substitutions` 传递。动态文件名或者文件夹名也是要 `substitutions` 传递。

#### 生成器没有模板

需要通过字符串拼接生成，`Nx` 提供常用的[方法](https://nx.dev/devkit/index#functions)，里面大部分都是操作配置文件（workspace.json、project.json、package.json）相关。

- 如果需要创建 `json` 文件需要使用 `writeJson<T>(tree, path, value, options?): void`
- 如果需要创建其他文件需要使用 `Tree.write(filePath: string, content: Buffer | string, options?: TreeWriteOptions): void`
- 如果需要创建空文件夹可以借助 `.gitkeep` 使用 `Tree.write(filePath/.gitkeep, '')`

> 创建文件时不需要先创建文件夹，内部安全处理。

#### schema

```ts
{
  name: string;
  project: string;
  directory?: string;
  viewsDirectory?: string;
  partials?: boolean;
  flat?: boolean;
}
```

- name：模块名，比如：`user`，`login`
- project：项目名，比如：`client`
- directory: 目录名：比如：`user/login`
- viewsDirectory：模板路径：比如：`src/views`
- partials: 是否包含 `partials` 文件夹
- flat：是否包含模块名目录

目标路径文件夹：project 路径 + viewsDirectory 路径 + directory 路径 + name 路径

1. `name` 不能重名，重名会抛出目标路径文件夹存在错误
2. 如果想要 `user/home.main.js` 和 `user/info.main.js` 这样结果，就需要同时使用 `directory: user` 和 `flat: true`，不然就会抛出目标路径文件夹存在错误。如果只设置 `directory: user` 就会出现 `user/info/info.main.js`

统一设置模板内 `partials` 文件夹

```ts
const partials = `${options.projectDirectory}/partials`;
if (options.partials && !tree.exists(partials)) {
  tree.write(`${partials}/.gitkeep`, '');
}
```

如果不存在就设置，存在就忽略。

#### 单元测试

单元测试使用 [jest](https://jestjs.io/)，和大多数单元测试写法一样。这里说几个要点：

1. `appTree = createTreeWithEmptyWorkspace()` 创建内存虚拟文件系统树，需要用到 `Tree` 地方都可以使用它。
2. 默认是没有项目的，需要自己创建项目，并且没有测试方法提供，我直接使用 `import { applicationGenerator } from '@nrwl/nest';`，只需要传递 `{name: 'test'}` 即可
3. 使用 `await generator(appTree, options);` 创建内存虚拟文件，然后通过 `Tree` 方法 `exists` 检查是否存在，`read` 读取文件，匹配是否包含预期内容

有了虚拟文件系统树，测试方便多了。

## 总结

在本文中，我们通过实现一个 `mvc` 的 `views` 插件介绍了 `Nx` 的插件化思想。为了说明它，我们一步一步实现了它，并了解了它是如何在幕后工作的。然后，我们学习了如何使用内置工具方法实现自己的插件这个过程。正如 `Nx` 的官网介绍：`Nx makes scaling easy.`

## 挖坑

1. 多个 `runExecutor` 不能并行执行

前面有个地方说了，如果有多个 `runExecutor` 不能并行执行，最近在翻看源码时候发现 [ssr-dev-server](https://github.com/nrwl/nx/blob/master/packages/webpack/src/executors/ssr-dev-server/ssr-dev-server.impl.ts) 的执行器。它主要是做服务端渲染，里面需要有 `browserTarget` 和 `serverTarget` 需要传递 2 个独立 `target` 配置。它里面用的一个方法 [combineAsyncIterables](https://github.com/nrwl/nx/blob/master/packages/devkit/src/utils/async-iterable/combine-async-iterables.ts)，相当于就是并行 `AsyncGenerator`。

2. 在 express 使用 webpack 提供中间件

这个如果在单页应用里面没什么问题，在服务端渲染里这个还是有点问题，它的过程：

- node 启动服务端
- 运行 webpack 中间件打包
- 运行 nestjs

每次 nestjs 文件保存，重新执行过程，views 模板项目相关的编译不会触发整个过程。

这样有了一个问题，会等很久。这不是不能接受的。

你这时候你可能要说用 `ssr-dev-server`，确实我也想到了。理想很丰满，现实很骨感，整个 `Executor` 没有多大问题，这个执行里面有一个 `waitUntilServerIsListening` 方法，这个方法是 `nodejs` 的 `net`，跨进程通讯用的，我在使用这个 `Executor` 时候，只要一保存就会抛出错误，连接失败。

我就索性放弃之前中间件方案，改用 `ssr-dev-server` 实现，直接写了一个 `serveExecutor`，`views` 模板里面使用 `webpackExecutor`，`nestjs` 使用 `nodeExecutor`，代码基本一样，去除了 `waitUntilServerIsListening`。

现在保存 `nestjs` 文件保存，并不会重新执行 `views` 模板。

保存 `views` 模板会执行整个过程。

因为现在是并行执行，所有非常快。

唯一瑕疵：就是 `views` 出错会就挂了，需要重启整个过程。还有就是有概率会出现 `nodeExecutor` 和 `webpackExecutor` 配置串问题，重启一下就好了，具体原因不明，理论是不会出现。

> 接下来，我们会用这种方式来构建更多的扩展，帮助我们提升工作效率。
