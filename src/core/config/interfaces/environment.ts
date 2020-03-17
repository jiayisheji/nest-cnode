export interface EnvironmentConfig {
    // 获取node环境变量 当前环境标识 'development' | 'production' | 'test'
    environment: string;
    // 主机地址
    host: string;
    // 端口号
    port: number;
    // 是否压缩静态资源
    mini_assets: boolean;
    // 静态资源主机地址
    // static: string;
    // express session 秘钥
    session_secret: string;
    // cookie 标识
    cookie_name: string;
    // 超级管理员标识
    super_admin: string;
    // 是否开发环境
    isDevelopment: boolean;
    // 是否生产环境
    isProduction: boolean;
    // 是否测试环境
    isTest: boolean;
}