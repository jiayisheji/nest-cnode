export interface RedisConfig {
    host: string;
    port: number;
    password: string;
    db: number;
    getConfig(): () => Pick<RedisConfig, 'getConfig'>;
}

export default {
    host: '{{env.REDIS_HOST}}',
    port: '{{env.REDIS_PORT}}',
    password: '{{env.REDIS_PASSWORD}}',
    db: '{{env.REDIS_DB}}',
    getConfig() {
        return {
            host: this.host,
            port: +this.port || 6379,
            password: this.password || undefined,
            db: +this.db || 0,
        };
    },
};
