/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Bootstrapping } from './bootstrapping';
import hbs = require('hbs');

new Bootstrapping()
  .startup(async (app: NestExpressApplication, useExpressMiddleware: (app: NestExpressApplication) => void) => {
    useExpressMiddleware(app);
    // register partials
    hbs.registerPartials(join(__dirname, 'views'));
  })
  .catch(console.error);
