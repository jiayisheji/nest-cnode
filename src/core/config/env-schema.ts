import * as Joi from 'joi';

const string = Joi.string();
const number = Joi.string();
const boolean = Joi.boolean();

export default Joi.object({
    NODE_ENV: string
        .valid(['development', 'production', 'test'])
        .default('development'),
    PORT: number.default(3000),
    HOST: string.default('localhost'),
    SUPER_ADMIN: string.empty('').default('super_admin'),
    STATIC_HOST: string.empty('').default(''),
    MINI_ASSETS: boolean.default(false),
    SESSION_SECRET: string.required(),
    AUTH_COOKIE_NAME: string.required(),
    // github配置验证
    GITHUB_CLIENT_ID: string.required(),
    GITHUB_CLIENT_SECRET: string.required(),
    GITHUB_CALLBACK_URL: string.required(),
    // 七牛配置验证
    QN_ACCESS_KEY: string.empty('').default(''),
    QN_SECRET_KEY: string.empty('').default(''),
    QN_BUCKET: string.empty('').default(''),
    QN_UPLOAD_URL: string.empty('').default(''),
    // 本地上传路径配置
    UPLOAD_LOCATION: string.required(),
    // 邮箱配置验证
    MAIL_HOST: string.hostname().required(),
    MAIL_PORT: number.required(),
    MAIL_USER: string.email().required(),
    MAIL_PASS: string.required(),
    // redis配置验证
    REDIS_HOST: string.hostname().default('127.0.0.1'),
    REDIS_PORT: number.default(6379),
    REDIS_PASSWORD: string.empty('').default(''),
    REDIS_DB: number.default(0),
    // mongodb配置验证
    MONGO_HOST: string.hostname().default('localhost'),
    MONGO_PORT: number.default(27017),
    MONGO_USER: string.empty('').default(''),
    MONGO_PASS: string.empty('').default(''),
    MONGO_DBS: string.empty('').default(''),
});
