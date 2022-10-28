const { types, scopes } = require('./.cz-config.js');

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100],
    /**
     * scope-enum 提交 scope 的枚举
     */
    'scope-enum': [2, 'always', scopes.map((s) => s.name)],
    /**
     * type-enum 提交的类型枚举
     */
    'type-enum': [2, 'always', types.map((t) => t.value)],
  },
};
