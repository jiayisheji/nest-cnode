export interface ExpressConfig {
    // 获取node环境变量 当前环境标识
    environment: 'development' | 'production' | 'test';
    // 主机地址
    host: string;
    // 端口号
    port: number;
    // 是否压缩静态资源
    assets: string;
    // 静态资源主机地址
    static: string;
    // express session 秘钥
    secret: string;
    // cookie 标识
    cookie: string;
    // 超级管理员标识
    super: string;
    // 是否开发环境
    isDevelopment: () => boolean;
    // 是否生产环境
    isProduction: () => boolean;
    // 是否测试环境
    isTest(): () => boolean;
}

// 获取node环境变量
export default {
    environment: process.env.NODE_ENV,
    host: '{{env.HOST}}',
    port: '{{env.PORT}}',
    secret: '{{env.SESSION_SECRET}}',
    assets: '{{env.MINI_ASSETS}}',
    static: '{{env.STATIC_HOST}}',
    super: '{{env.SUPER_ADMIN}}',
    cookie: '{{env.AUTH_COOKIE_NAME}}',
    isDevelopment(): boolean {
        return this.get('express.environment') === 'development';
    },
    isProduction() {
        return this.get('express.environment') === 'production';
    },
    isTest() {
        return this.get('express.environment') === 'test';
    },
};
