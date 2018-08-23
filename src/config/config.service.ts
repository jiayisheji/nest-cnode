import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';

export interface Config {
    [prop: string]: any;
}

export class ConfigService {
    // 系统配置
    private readonly envConfig: Config;
    // 应用配置
    private readonly config: Config = {};

    constructor(filePath: string) {
        this.envConfig = this.validateInput(dotenv.parse(fs.readFileSync(filePath)));
        this.initConfig();
    }
    /** 初始化应用配置 */
    private initConfig() {
        // 'google', 'baidu', 'local'
        this.set('search', 'baidu');
        // 应用名称
        this.set('name', 'CNode技术社区');
        // 应用地址
        this.set('host', this.getEnv('HOST'));
        // 帖子列表一页条数
        this.set('list_topic_count', 20);
        // 使用cookie符号键
        this.set('keys', this.get('NAME') + `_${Date.now()}_${Math.random().toString().substr(-6, 6)}`);
        // 首页帖子分类
        this.set('tabs', 'all|全部&good|精华&share|分享&ask|问答&job|招聘&dev|客户端测试'.split('&').map((item) => item.split('|')));
        // meta设置
        this.set('meta', {
            title: this.get('NAME'),
            description: 'CNode：Node.js专业中文社区',
            keywords: 'nodejs, node, express, connect, socket.io',
        });
        // logo设置
        this.set('logo', '/public/images/cnodejs_light.svg');
        // icon设置
        this.set('icon', '/public/images/cnode_icon_32.png');
        // RSS配置
        this.set('rss', {
            title: 'CNode：Node.js专业中文社区',
            link: 'http://cnodejs.org',
            language: 'zh-cn',
            description: 'CNode：Node.js专业中文社区',
            // 最多获取的RSS Item数量
            max_rss_items: 50,
        });
        // 七牛配置
        this.set('qn_access', {
            accessKey: 'your access key',
            secretKey: 'your secret key',
            bucket: 'your bucket name',
            origin: 'http://your qiniu domain',
            // 如果vps在国外，请使用 http://up.qiniug.com/ ，这是七牛的国际节点
            // 如果在国内，此项请留空
            uploadURL: 'http://xxxxxxxx',
        });
        // 邮件配置
        this.set('mail_opts', {
            accessKey: 'your access key',
            secretKey: 'your secret key',
            bucket: 'your bucket name',
            origin: 'http://your qiniu domain',
            // 如果vps在国外，请使用 http://up.qiniug.com/ ，这是七牛的国际节点
            // 如果在国内，此项请留空
            uploadURL: 'http://xxxxxxxx',
        });
        // mongodb url
        // tslint:disable-next-line:max-line-length
        this.set('mongodb_url', `mongodb://${this.getEnv('MONGO_USER')}:${this.getEnv('MONGO_PASS')}@${this.getEnv('MONGO_HOST')}:${this.getEnv('MONGO_PORT')}/${this.getEnv('MONGO_DBS')}`);
    }

    /** 确保设置了所有需要的变量，并返回经过验证的JavaScript对象，包括应用的默认值。 */
    private validateInput(envConfig: Config): Config {
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
            MONGO_HOST: Joi.string().hostname().required(),
            MONGO_PORT: Joi.string().required(),
            MONGO_USER: Joi.string().required(),
            MONGO_PASS: Joi.string().required(),
            MONGO_DBS: Joi.string().required(),
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

    /** 获取配置 */
    get(key: string): string {
        return this.config[key];
    }

    /** 设置配置 */
    set(key: string, value: any): this {
        this.config[key] = value;
        return this;
    }

    /** 删除配置 */
    delete(key: string): this {
        delete this.config[key];
        return this;
    }

    /** 获取系统配置 */
    getEnv(key: string): any {
        return this.envConfig[key];
    }
    /** 是否开发模式 */
    get isDevelopment(): boolean {
        return this.getEnv('NODE_ENV') === 'development';
    }
    /** 用于本地调试，开发模式为true */
    get isDebug(): boolean {
        return this.isDevelopment;
    }
}