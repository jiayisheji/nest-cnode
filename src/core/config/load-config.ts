import adminsConfig from './admins';
import applicationConfig from './application';
import databaseConfig from './database';
import environmentConfig from './environment';
import githubConfig from './github';
import mailerConfig from './mailer';
import redisConfig from './redis';

export default [
  applicationConfig,
  databaseConfig,
  redisConfig,
  environmentConfig,
  githubConfig,
  mailerConfig,
  adminsConfig,
];
