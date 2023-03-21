module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage', // 按需引入 core-js 中的模块
        corejs: '3.28', // 必须指定 core-js 版本
      },
    ],
  ],
};
