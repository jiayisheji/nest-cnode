import { registerAs } from '@nestjs/config';
import { getEnv, getEnvNumber } from './utils';

export default registerAs('database', () => {
    const host = getEnv('MONGO_HOST', 'localhost');
    const port = getEnvNumber('MONGO_PORT', 27017);
    const user = getEnv('MONGO_USER');
    const pass = getEnv('MONGO_PASS');
    const dbs = getEnv('MONGO_DBS');

    return {
        host,
        port,
        user,
        pass,
        dbs,
        url: `mongodb://${user}:${pass}@${host}:${port}/${dbs}`,
    };
});