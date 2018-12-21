import * as fs from 'fs';
import { parse } from 'dotenv';
import { EnvConfig } from './config.interface';

export class ConfigService<T = EnvConfig> {
    // 系统配置
    private readonly envConfig: T;

    constructor(filePath: string, validator?: (envConfig: T) => T) {
        // 解析配置文件
        const configFile: T = parse(fs.readFileSync(filePath));
        // 验证配置参数
        if (typeof validator === 'function') {
            const envConfig: T = validator(configFile);
            if (typeof envConfig !== 'object') {
                throw Error('validator return value is not object');
            }
            this.envConfig = envConfig;
        } else {
            this.envConfig = configFile;
        }
    }

    /**
     * 获取配置
     * @param key
     * @param defaultVal
     */
    get(key: string, defaultVal?: any): string {
        return process.env[key] || this.envConfig[key] || defaultVal;
    }

    /** 获取系统配置 */
    getKeys(keys: string[]): any {
        return keys.reduce((obj, key: string) => {
            obj[key] = this.get(key);
            return obj;
        }, {});
    }

    /**
     * 获取数字
     * @param key
     */
    getNumber(key: string): number {
        return Number(this.get(key));
    }

    /**
     * 获取布尔值
     * @param key
     */
    getBoolean(key: string): boolean {
        return Boolean(this.get(key));
    }

    /**
     * 获取字典对象和数组
     * @param key
     */
    getJson(key: string): { [prop: string]: any } | null {
        try {
            return JSON.parse(this.get(key));
        } catch (error) {
            return null;
        }
    }

    /**
     * 检查一个key是否存在
     * @param key
     */
    has(key: string): boolean {
        return this.get(key) !== undefined;
    }

    /** 开发模式 */
    get isDevelopment(): boolean {
        return this.get('NODE_ENV') === 'development';
    }
    /** 生产模式 */
    get isProduction(): boolean {
        return this.get('NODE_ENV') === 'production';
    }
    /** 测试模式 */
    get isTest(): boolean {
        return this.get('NODE_ENV') === 'test';
    }
}