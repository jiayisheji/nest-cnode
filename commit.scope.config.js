const { projects } = require('./workspace.json');

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

// 项目 Scopes
const projectScopes = Object.entries(projects).reduce((arr, [key, value]) => {
  return [
    ...arr,
    {
      name: key,
      readme: `/${value}`,
    },
  ];
}, []);

module.exports = [...projectScopes, ...defaultScopes];
