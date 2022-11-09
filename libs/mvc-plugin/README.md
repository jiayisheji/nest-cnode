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
  }
}
```

## Building

Run `nx build mvc-plugin` to build the library.

## Running unit tests

Run `nx test mvc-plugin` to execute the unit tests via [Jest](https://jestjs.io).
