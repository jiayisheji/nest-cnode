import { registerAs } from '@nestjs/config';
import { getEnv, getEnvNumber } from './utils';

export default registerAs('redis', () => {
    const host = getEnv('REDIS_HOST', '127.0.0.1');
    const port = getEnvNumber('REDIS_PORT', 6379);
    const password = getEnv('REDIS_PASSWORD') || undefined;
    const db = getEnvNumber('REDIS_DB', 0);
    return {
        host,
        port,
        password,
        db,
    };
});