module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100],
    /**
     * scope-enum 提交scope的枚举
     * core： 核心模块
     * controllers： 特性模块
     * main： 入口
     * assets： 静态资源
     * shared： 共享模块
     * tools： 工具助手
     * views： 页面模板
     * models: 数据库
     * deps: npm依赖
     */
    'scope-enum': [
      2,
      'always',
      [
        'assets',
        'controllers',
        'core',
        'deps',
        'models',
        'shared',
        'tools',
        'views',
      ],
    ],
    /**
     * type-enum 提交的类型枚举
     * build： 主要目的是修改项目构建系统(例如 glup， webpack， rollup 的配置等) 的提交
     * chore： 不属于以上类型的其他类型
     * ci： 主要目的是修改项目继续集成流程(例如 Travis， Jenkins， GitLab CI， Circle等) 的提交
     * docs： 文档更新
     * feat： 新增功能
     * merge： 分支合并 Merge branch ? of ?
     * fix： bug 修复
     * perf： 性能, 体验优化
     * refactor： 重构代码(既没有新增功能， 也没有修复 bug)
     * revert： 回滚某个更早之前的提交
     * release: 发布版本
     * style： 不影响程序逻辑的代码修改(修改空白字符， 格式缩进， 补全缺失的分号等， 没有改变代码逻辑)
     * test： 新增测试用例或是更新现有测试
     */
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'merge',
        'fix',
        'perf',
        'refactor',
        'revert',
        'release',
        'style',
        'test',
      ],
    ],
  },
};
