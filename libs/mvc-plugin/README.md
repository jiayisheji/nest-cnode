# mvc-plugin

This library was generated with [Nx](https://nx.dev).

## Install

```bash
npm install @nest-cnode/mvc-plugin --save-dev
```

## Use

open `project.json` be modified as follows:

```json
{
  "build": {
    "executor": "@nest-cnode/mvc-plugin:build",
    "options": {
      ...
      "stylePreprocessorOptions": {
        "includePaths": ["apps/client/src/views/shared/styles"]
      },
      "viewOptions": {
        "webpackConfig": "apps/client/view-webpack.config.js"
      }
    },
    "configurations": {
      "production": {
        ...
        "viewOptions": {
          "outputHashing": "all",
          "webpackConfig": "apps/client/view-webpack.config.js",
          "sourceMap": false
        }
      }
    }
  },
  "serve": {
    "executor": "@nest-cnode/mvc-plugin:serve",
    "options": {
      "buildTarget": "client:build",
      "buildTargetOptions": {},
      "buildTargetViewOptions": {}
    }
  }
}
```

### Custom Webpack Config

```ts
// Nodejs
composePlugins(withNx(), (config, { options, context }) => {
  return config;
});
// Web
composePlugins(withNx({ skipTypeChecking: true }), withWeb(), (config, { options, context }) => {
  return config;
});
```

- skipTypeChecking: 跳过 `Typescript` 类型检查
- config：[Configuration](https://github.com/webpack/webpack/blob/main/types.d.ts)
- options：[NormalizedWebpackExecutorOptions](https://github.com/nrwl/nx/blob/master/packages/webpack/src/executors/webpack/schema.d.ts)
- context: [ExecutorConfig](https://github.com/nrwl/nx/blob/master/packages/nx/src/config/misc-interfaces.ts)

## Building

Run `nx build mvc-plugin` to build the library.

## Running unit tests

Run `nx test mvc-plugin` to execute the unit tests via [Jest](https://jestjs.io).
