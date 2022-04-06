const glob = require('glob');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isPartials = (pathname) => pathname.includes('-partials-');

exports.isPartials = isPartials;
/**
 * 读取js入口文件的路径(用于webpack输入)
 *
 * **注意**:入口文件名必须是 `main.js`
 * @param {string} viewsPath
 * @returns
 */
exports.getWebpackEntry = (viewsPath) => {
  const mainMatch = new RegExp(viewsPath + '/(.*)/main.js');
  const partialsMatch = new RegExp(viewsPath + '/common/partials/(.*)/*.hbs');
  const results = glob
    .sync(viewsPath + '/**/main.js')
    .reduce((webpackEntry, entry) => {
      const folder = entry.match(mainMatch);
      if (folder == null) {
        return webpackEntry;
      }
      const folderPath = folder[1];
      const moduleName = folderPath.replace(/\//g, '-');
      const partials = glob.sync(entry.replace('main.js', 'partials/*.hbs'));
      webpackEntry.push({
        name: moduleName,
        entry: './' + entry,
        template: entry.replace('main.js', 'index.hbs'),
        filename: folder[1] + '/index.hbs',
        partials: partials.map((partial) => {
          return {
            name: `${moduleName}-partials-${path
              .basename(partial)
              .replace('.hbs', '')}`,
            template: partial,
            filename: partial.replace(viewsPath, ''),
          };
        }),
      });
      return webpackEntry;
    }, []);

  glob
    .sync(viewsPath + '/common/partials/**/*.hbs')
    .reduce((webpackEntry, entry) => {
      const folder = entry.match(partialsMatch);
      if (folder == null) {
        return webpackEntry;
      }
      const folderPath = 'common/partials/' + folder[1];
      const moduleName = folderPath.replace(/\//g, '-');
      webpackEntry.push({
        name: moduleName,
        template: entry,
        filename: entry.replace(viewsPath + '/', ''),
        partials: [],
      });
      return webpackEntry;
    }, results);
  return results;
};

/**
 * 转换 webpack entry
 * @param {{name: string;entry: string; partials: {partial: string}[]}[]} webpackEntry
 * @param {{name: string;entry: string; }} layoutEntry
 */
exports.transformWebpackEntry = function (webpackEntry, layoutEntry) {
  return webpackEntry.reduce(
    (entry, item) => {
      entry[item.name] = isPartials(item.name) ? layoutEntry.entry : item.entry;
      if (Array.isArray(item.partials)) {
        item.partials.forEach((partial) => {
          entry[partial.name] = layoutEntry.entry;
        });
      }
      return entry;
    },
    {
      [layoutEntry.name]: layoutEntry.entry,
    }
  );
};

/**
 * 转换 webpack entry 生成 HtmlWebpackPlugin
 * @param {*} webpackEntry
 * @param {*} layoutEntry
 */
exports.resolveViews = function (webpackEntry, initial) {
  const viewsPath = initial.views;
  const views = webpackEntry.reduce(
    (entry, { partials, ...item }) => {
      item.filename = `${viewsPath}/${item.filename}`;
      item.chunk = isPartials(item.name) ? false : item.name;
      entry.push(item);
      if (Array.isArray(partials)) {
        partials.forEach((partial) => {
          partial.filename = `${viewsPath}${partial.filename}`;
          partial.chunk = false;
          entry.push(partial);
        });
      }
      return entry;
    },
    [
      {
        ...initial.layout,
        chunk: false,
      },
    ]
  );

  return views.map((obj) => {
    return new HtmlWebpackPlugin({
      filename: obj.filename,
      template: obj.template,
      templateParameters: {
        reload: obj.reload,
      },
      // 全部关闭 不需要压缩 不需要优化
      minify: false,
      inject: false,
      cache: false,
      publicPath: '/',
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunks: obj.chunk ? ['manifest', 'vendor', 'commons', obj.chunk] : false,
    });
  });
};
