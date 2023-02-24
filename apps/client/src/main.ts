/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { mvcViewDevWebpack } from '@nest-cnode/mvc-plugin';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ProjectConfiguration } from '@nrwl/devkit';
import { debounce } from 'lodash';
import { join } from 'path';
import * as project from '../project.json';
import { Bootstrapping } from './bootstrapping';
import hbs = require('hbs');
import hbsUtils = require('hbs-utils');

new Bootstrapping()
  .startup(async (app: NestExpressApplication, useExpressMiddleware: (app: NestExpressApplication) => void) => {
    useExpressMiddleware(app);
    try {
      const reloadServer = await mvcViewDevWebpack(app, project as unknown as ProjectConfiguration);
      // register and watch partials
      hbsUtils(hbs).registerWatchedPartials(
        join(__dirname, 'views'),
        {
          onchange: debounce(function () {
            reloadServer && reloadServer.reload();
            console.log(`Partials refreshed success!`);
          }, 100),
        },
        function () {
          console.log(`The initial registration of partials is complete`);
        }
      );
    } catch (error) {
      console.log('mvcViewDevWebpack startup', error);
    }
  })
  .catch(console.error);
