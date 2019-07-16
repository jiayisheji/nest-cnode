import * as Joi from 'joi';
import { EnvConfig, EnvValidator } from './config';

export class ConfigValidate implements EnvValidator {
    /** 确保设置了所有需要的变量，并返回经过验证的JavaScript对象，包括应用的默认值。 */
    validateInput(envConfig: EnvConfig): EnvConfig {
        const envVarsSchema: Joi.ObjectSchema = Joi.object({
            NODE_ENV: Joi.string()
                .valid(['development', 'production', 'test'])
                .default('development'),
            PORT: Joi.number().default(3000),
            HOST: Joi.string().default('localhost'),
            SUPER_ADMIN: Joi.string().empty('').default('super_admin'),
            STATIC_HOST: Joi.string().empty('').default(''),
            MINI_ASSETS: Joi.boolean().default(false),
            SESSION_SECRET: Joi.string().required(),
            AUTH_COOKIE_NAME: Joi.string().required(),
            // github配置验证
            GITHUB_CLIENT_ID: Joi.string().required(),
            GITHUB_CLIENT_SECRET: Joi.string().required(),
            GITHUB_CALLBACK_URL: Joi.string().required(),
            // 七牛配置验证
            QN_ACCESS_KEY: Joi.string().empty('').default(''),
            QN_SECRET_KEY: Joi.string().empty('').default(''),
            QN_BUCKET: Joi.string().empty('').default(''),
            QN_UPLOAD_URL: Joi.string().empty('').default(''),
            // 邮箱配置验证
            MAIL_HOST: Joi.string().hostname().required(),
            MAIL_PORT: Joi.number().required(),
            MAIL_USER: Joi.string().email().required(),
            MAIL_PASS: Joi.string().required(),
            // redis配置验证
            REDIS_HOST: Joi.string().hostname().default('127.0.0.1'),
            REDIS_PORT: Joi.number().default(6379),
            REDIS_PASSWORD: Joi.string().empty('').default(''),
            REDIS_DB: Joi.number().default(0),
            // mongodb配置验证
            MONGODB_URI: Joi.string().required(),
        });

        const { error, value: validatedEnvConfig } = Joi.validate(
            envConfig,
            envVarsSchema,
        );

        if (error) {
            throw new Error(`Config validation error: ${error.message}`);
        }
        return validatedEnvConfig;
    }
}