const glob = require('glob');
// workspace.json 已经弃用，现在以项目里的 project.json 和 package.json 为主
const projects = glob.sync('@(apps|libs)/**/project.json');

// 默认自定义 scopes
const defaultScopes = [
  {
    name: 'wip',
    readme: 'Work In Process',
  },
  {
    name: 'workspace',
    readme: '/',
  },
  {
    name: 'tools',
    readme: '/tools',
  },
  {
    name: 'docs',
    readme: '/docs',
  },
  {
    name: 'dev-deps',
    readme: 'bump package-name from 7.0.1 to 8.0.1',
  },
];
// [filepath, projectType, projectName]
const match = new RegExp('(apps|libs)/(.*)/project.json');

// 项目 Scopes
for (let index = 0; index < projects.length; index++) {
  const filepath = projects[index];
  // excluding project e2e
  if (filepath.startsWith('apps') && filepath.includes('-e2e')) {
    projects[index] = null;
    continue;
  }

  const result = filepath.match(match);

  if (result) {
    const [, projectType, projectName] = result;
    projects[index] = {
      name: projectName,
      readme: `/${projectType}/${projectName}`,
    };
  } else {
    projects[index] = null;
  }
}

module.exports = [...projects, ...defaultScopes].filter(Boolean);
