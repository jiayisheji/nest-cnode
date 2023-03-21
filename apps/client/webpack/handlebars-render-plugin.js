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
            if (reload && data.outputName === layout) {
              data.html += '\r\n<script src="/reload/reload.js"></script>';
            } else if (data.plugin.userOptions.chunks) {
              data.html = appendResource(data.html, data.headTags.concat(data.bodyTags));
            }
            cb(null, data);
          }
        );
      }
    );
  }
}

/**
 *
 * @param {string} html
 * @param {{attributes: {href: string; rel: string; type: string; defer: boolean; src: string}; tagName: string;}[]} tags
 * @returns
 */
function appendResource(html, tags) {
  let scripts = '{{#content "script" mode="append"}}\r\n',
    styles = '{{#content "style" mode="append"}}\r\n',
    resources = '\r\n';

  for (const { tagName, attributes } of tags) {
    switch (tagName) {
      case 'script': {
        // 这是一个无用的 js
        if (attributes.src.endsWith('styles.js')) {
          continue;
        } else {
          scripts += `<script type="${attributes.type ?? 'text/javascript'}" ${attributes.defer ? 'defer' : ''} src="${
            attributes.src
          }"></script>\r\n`;
        }
        break;
      }
      case 'link': {
        styles += `<link href="${attributes.href}" rel="${attributes.rel}">\r\n`;
        break;
      }
    }
  }

  resources = '\r\n' + styles + '{{/content}}\r\n' + scripts + '{{/content}}\r\n';
  /***
   * 可能写法 page 可以忽略 {{#extend "layout"}}{{/extend}}
   * {{#extend "layout"}}
   *    {{#content "body"}}
   *      // code
   *    {{/content}}
   * {{/extend}}
   */
  const beginIndex = html.lastIndexOf('{{#extend "layout"}}');
  const endIndex = html.lastIndexOf('{{/extend}}');
  return beginIndex !== -1 && endIndex !== -1
    ? html.substring(0, endIndex) + resources + '{{/extend}}\r\n'
    : html + resources;
}

module.exports = HandlebarsRenderPlugin;
