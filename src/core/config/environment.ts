import { registerAs } from '@nestjs/config';
import { getEnv, getEnvNumber, getEnvBoolean } from './utils';
import { EnvironmentConfig } from './interfaces';

export default registerAs('environment', (): EnvironmentConfig => {
    const host = getEnv('HOST', 'localhost');
    const port = getEnvNumber('PORT', 3000);
    const super_admin = getEnv('SUPER_ADMIN', 'super_admin');
    const session_secret = getEnv('SESSION_SECRET', 'cnode');
    const cookie_name = getEnv('AUTH_COOKIE_NAME', 'nest_cnode');
    const environment = getEnv('NODE_ENV', 'development');
    const mini_assets = getEnvBoolean('MINI_ASSETS');
    return {
        host,
        port,
        super_admin,
        session_secret,
        mini_assets,
        cookie_name,
        environment,
        isDevelopment: environment === 'development',
        isProduction: environment === 'production',
        isTest: environment === 'test',
    };
});