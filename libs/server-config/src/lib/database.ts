import { registerAs } from '@nestjs/config';
import * as joi from 'joi';
import { env } from './env';

export const databaseSchema = {
  MONGO_DBS: joi.string().required(),
  MONGO_USER: joi.string().required(),
  MONGO_PASS: joi.string().required(),
  MONGO_HOST: joi.string().hostname().default('localhost'),
  MONGO_PORT: joi.number().port().default(27017),
};

export type databaseEnv = {
  MONGO_DBS: string;
  MONGO_USER: string;
  MONGO_PASS: string;
  MONGO_HOST: string;
  MONGO_PORT: number;
};

export const databaseConfig = registerAs('database', () => {
  const host = env<databaseEnv>('MONGO_HOST');
  const port = env<databaseEnv, number>('MONGO_PORT', (v) => parseInt(v, 10));
  const user = env<databaseEnv>('MONGO_USER');
  const pass = env<databaseEnv>('MONGO_PASS');
  const dbs = env<databaseEnv>('MONGO_DBS');
  return {
    host,
    port,
    user,
    pass,
    dbs,
    uri: `mongodb://${user}:${pass}@${host}:${port}/${dbs}`,
  };
});
