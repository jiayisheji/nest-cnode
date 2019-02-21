export function getRedisConfig(config) {
    const client = config.getKeys(['REDIS_HOST', 'REDIS_PORT', 'REDIS_DB', 'REDIS_PASSWORD']);
    return Object.keys(client).reduce((obj, key) => {
        const field = key.split('_')[1].toLocaleUpperCase();
        obj[field] = key === ('REDIS_PORT' || 'REDIS_DB') ? parseInt(client[key], 10) : client[key];
        return obj;
    }, {});
}