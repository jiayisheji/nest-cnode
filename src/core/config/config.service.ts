import { config as dotenv } from 'dotenv';
import { resolve, join, extname, basename, isAbsolute, dirname } from 'path';
import { EnvValidator, ConfigOptions, EnvConfig } from './config.interface';
import { get } from 'lodash';
import { Glob } from 'glob';

export interface Config {
    [key: string]: {
        [key: string]: any;
    };
}
// 匹配模板正则表达式
const MATCH_TEMPLATE_REGULAR = /{{(.+?)}}/g;
// 替换模板变量
function matchTemplate(tpl: string, data: EnvConfig) {
    let match: string[];
    // tslint:disable-next-line: no-conditional-assignment
    while ((match = MATCH_TEMPLATE_REGULAR.exec(tpl)) !== null) {
        if (match[1]) {
            // 如果字符串模板和匹配出来字符串模板一样，直接替换
            tpl = tpl.replace(match[0], get(data, match[1]));
        } else {
            // 如果如果不一样，直接设置为空
            tpl = tpl.replace(match[0], '');
        }
    }
    return tpl;
}

export class ConfigService {
    // 根路径
    public static rootPath: string;
    // env参数验证方法
    private static envValidator: EnvValidator;

    // 系统配置
    private static config: Config;

    constructor(config: Config = {}) {
        this.bindCustomHelpers(config);
        ConfigService.config = config;
    }
    /**
     * 解析和存储应用程序的源目录
     * @param path
     */
    static resolveRootPath(startPath: string) {
        if (!isAbsolute(startPath)) {
            throw Error('Start path must be an absolute path');
        }
        if (!this.rootPath) {
            const root = this.root();
            let workingDir = startPath;
            let parent = dirname(startPath);
            while (workingDir !== root && parent !== root && parent !== workingDir) {
                workingDir = parent;
                parent = dirname(workingDir);
            }
            this.rootPath = workingDir;
        }
    }
    /**
     * 设置验证器
     * @param validator
     */
    static resolveEnvValidator(validator: EnvValidator) {
        this.envValidator = validator;
    }

    /**
     * 绑定this指向
     * @param config
     * @returns {string}
     */
    protected bindCustomHelpers(config: Config): Config {
        return Object.keys(config).reduce((configObj, configName) => {
            if (typeof configObj[configName] === 'function') {
                const helper = configObj[configName].bind(this);
                configObj[configName] = helper;
            }
            if (
                typeof configObj[configName] === 'object' &&
                configObj[configName] !== null
            ) {
                configObj[configName] = this.bindCustomHelpers(configObj[configName]);
            }
            return configObj;
        }, config);
    }

    /**
     * 加载配置
     * @param glob
     * @param options
     */
    static async load(glob: string, options: ConfigOptions): Promise<ConfigService> {
        const configs = await this.loadConfig(glob, options);
        return new ConfigService(configs);
    }

    /**
     * 加载配置
     * @param glob
     * @param options
     */
    private static loadConfig(
        glob: string,
        options?: ConfigOptions,
    ): Promise<Config> {
        // 处理路径
        glob = this.root(glob);
        return new Promise((resolve, reject) => {
            new Glob(glob, {}, (err: null, matches: string[]) => {
                /* istanbul ignore if */
                if (err) {
                    reject(err);
                } else {
                    const envConfig = this.loadEnv(options);
                    const configs = this.mergeConfig(
                        matches,
                        envConfig,
                        options && options.replaceConfigName,
                    );
                    resolve(configs);
                }
            });
        });
    }

    private static mergeConfig(configPaths: string[], envConfig: EnvConfig, replaceConfigName?: (name: string) => string): Config {
        const configs = configPaths.reduce((acc: Config, file: string) => {
            const module = require(file);
            const config = module.default || module;
            const configName = replaceConfigName ? replaceConfigName(this.getConfigName(file)) : this.getConfigName(file);
            acc[configName] = this.parseConfig(config, envConfig);
            return acc;
        }, {}) as {
            [key: string]: any;
        };
        // 如果env存在 并且使用envValidator验证优先使用 如果有配置config/env.ts 默认忽略
        if (envConfig.env) {
            configs.env = envConfig.env;
        }
        return configs;
    }

    /**
     * 解析处理config
     * @param config
     * @param envConfig
     */
    private static parseConfig(config: Config, envConfig: EnvConfig): Config {
        // 如果没有env直接返回
        if (!envConfig.env) {
            return config;
        }
        return Object.keys(config).reduce((configs, key) => {
            const value = config[key];
            if (typeof value === 'string') {
                configs[key] = matchTemplate(value, envConfig);
            } else {
                if (typeof value === 'object' && value.constructor === Object) {
                    configs[key] = this.parseConfig(value, envConfig);
                } else {
                    configs[key] = value;
                }
            }
            return configs;
        }, {});
    }

    /**
     * 从文件路径获取配置名
     * @param file
     */
    private static getConfigName(file: string): string {
        return basename(file, extname(file));
    }

    /**
     * 获取配置 静态方法
     * @param key
     * @param defaultVal
     */
    static get<D>(key: string | string[]): D;
    static get<D, T>(key: string | string[], defaultValue?: T): T;
    static get<D, T>(key: string | string[], defaultValue?: T): D | T {
        const configValue = get(ConfigService.config, key) as D;
        if (configValue === undefined) {
            return defaultValue;
        }
        return configValue;
    }

    /**
     * 获取配置
     * @param key
     * @param defaultVal
     */
    get<D>(key: string | string[]): D;
    get<D, T>(key: string | string[], defaultValue?: T): T;
    get<D, T>(key: string | string[], defaultValue?: T): D | T {
        return ConfigService.get(key, defaultValue);
    }

    /**
     * 获取根路径
     * @param dir 如果有值，返回拼接的路径
     */
    static root(dir: string = ''): string {
        const rootPath = this.rootPath || resolve(process.cwd());
        return resolve(rootPath, dir);
    }

    /**
     * 检查一个key是否存在
     * @param key
     */
    has(key: string): boolean {
        return get(ConfigService.config, key) !== undefined;
    }

    /**
     * 通过dotenv加载env变量
     * @param options
     */
    private static loadEnv(options?: ConfigOptions): EnvConfig {
        // 如果没有配置dotenv参数 直接返回
        if (!options) {
            return;
        }
        // 解析配置文件
        const configFile = dotenv({
            ...{
                path: join(process.cwd(), '.env'),
            },
            ...options,
        });
        const envValidator = ConfigService.envValidator;
        // 如果它不是一个验证方法 默认class
        if (typeof envValidator !== 'object') {
            return {};
        }
        return {
            env: envValidator.validateInput(configFile.parsed),
        };
    }

}