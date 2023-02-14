const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('./paths');

/** @typedef {import("webpack/lib/Compiler.js")} WebpackCompiler */
/** @typedef {import("webpack/lib/Compilation.js")} WebpackCompilation */

class HandlebarsRenderPlugin {
  constructor(options) {
    this.options = Object.assign(
      {
        htmlWebpackPluginOptions: [],
        // 开发模式才有刷新
        reload: false,
      },
      options
    );

    if (this.options.reload && !this.options.layout) {
      throw new Error('using "reload" must be added "layout" path');
    }
  }

  /**
   * Apply the plugin
   * @param {WebpackCompiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler) {
    const { htmlWebpackPluginOptions, reload, layout } = this.options;

    for (const plugin of htmlWebpackPluginOptions) {
      new HtmlWebpackPlugin(plugin).apply(compiler);
    }

    compiler.hooks.compilation.tap(
      'HandlebarsRenderPlugin',
      /**
       * Hook into the webpack compilation
       * @param {WebpackCompilation} compilation
       */
      (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tapAsync(
          'HandlebarsRenderPlugin',
          (data, cb) => {
            if (reload) {
              if (data.outputName === layout) {
                data.html += '\r\n<script src="/reload/reload.js"></script>';
              }
            } else {
              if (data.plugin.userOptions.chunks) {
                data.html += appendResource(data.headTags.concat(data.bodyTags));
              }
            }
            cb(null, data);
          }
        );
      }
    );
  }
}

function appendResource(tags) {
  const scripts = [],
    styles = [];

  for (const tag of tags) {
    switch (tag.tagName) {
      case 'script': {
        scripts.push(tag.attributes);
        break;
      }
      case 'link': {
        styles.push(tag.attributes);
        break;
      }
    }
  }

  let resources = '\r\n';

  resources += '{{#content "style" mode="append"}}\r\n';

  styles.forEach((item) => {
    resources += `<link href="${item.href}" rel="${item.rel}">\r\n`;
  });

  resources += '{{/content}}\r\n';
  resources += '{{#content "script" mode="append"}}\r\n';

  scripts.forEach((item) => {
    resources += `<script type="${item.type ?? 'text/javascript'}" ${item.defer ? 'defer' : ''} src="${
      item.src
    }"></script>\r\n`;
  });

  resources += '{{/content}}\r\n';

  return resources;
}

module.exports = HandlebarsRenderPlugin;
