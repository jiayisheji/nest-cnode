import { Logger } from '@nestjs/common';
import { Bootstrapping } from './bootstrapping';
import { environment } from './environments/environment';

/**
 * fix build not read .env file
 * @see https://github.com/nrwl/nx/issues/973#issuecomment-490211491
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const result = require('dotenv').config();
if (result.error) {
  throw result.error;
}

new Bootstrapping().startup().catch(() => {
  Logger.error(
    `NestCNode Run！port at ${process.env.PORT}, env: ${
      environment.production ? 'production' : 'development'
    }`
  );
});
