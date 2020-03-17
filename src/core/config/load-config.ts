import applicationConfig from './application';
import databaseConfig from './database';
import environmentConfig from './environment';
import redisConfig from './redis';
import githubConfig from './github';
import mailerConfig from './mailer';

export default [
    applicationConfig,
    databaseConfig,
    redisConfig,
    environmentConfig,
    githubConfig,
    mailerConfig
];