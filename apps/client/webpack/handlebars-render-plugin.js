const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('./paths');

class HandlebarsRenderPlugin {
  apply(compiler) {
    const htmlWebpackPluginOptions = paths.appHtml().reduce((options, html) => {
      return [
        ...options,
        new HtmlWebpackPlugin({
          template: html.template,
          chunks: html.chunks,
          filename: html.filename,
          inject: false,
          minify: {
            removeComments: true,
          },
        }),
      ];
    }, []);

    for (const plugin of htmlWebpackPluginOptions) {
      plugin.apply(compiler);
    }

    const reload = true;
    const layout = 'views/layout.hbs';

    compiler.hooks.compilation.tap('HandlebarsRenderPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tapAsync('HandlebarsRenderPlugin', (data, cb) => {
        if (reload && data.outputName === layout) {
          data.html += '\r\n<script src="/reload/reload.js"></script>';
        } else if (data.plugin.userOptions.chunks) {
          data.html += appendResource(data.headTags.concat(data.bodyTags));
        }
        cb(null, data);
      });
    });
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
