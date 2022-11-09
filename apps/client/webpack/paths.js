const path = require('path');
const fs = require('fs');
const glob = require('glob');
const project = require('../project.json');

const appDirectory = fs.realpathSync(process.cwd());

const sourceRoot = project.sourceRoot;

const resolveApp = (relativePath) => path.resolve(appDirectory, sourceRoot, relativePath);

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
        chunks: filename.endsWith('.template.hbs') && [entry],
        inject: false,
      });
    } else {
      options.push({
        template: filepath.replace(sourceRoot, './src'),
        filename: `${viewsPath}/${filepath.replace(fileMatch, '$1')}.hbs`,
        inject: false,
      });
    }
  }
  return options;
}

module.exports = {
  appEntry: getEntry,
  appHtml: getHtml,
};
