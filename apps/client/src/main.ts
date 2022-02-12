import { Logger } from '@nestjs/common';
import { Bootstrapping } from './bootstrapping';
import { environment } from './environments/environment';

new Bootstrapping().startup().catch(() => {
  Logger.error(
    `NestCNode Run！port at ${process.env.PORT}, env: ${
      environment.production ? 'production' : 'development'
    }`
  );
});
