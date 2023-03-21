/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { NestExpressApplication } from '@nestjs/platform-express';
import { debounce } from 'lodash';
import { join } from 'path';
import { Bootstrapping } from './bootstrapping';
import hbs = require('hbs');
import hbsUtils = require('hbs-utils');
import reload = require('reload');

new Bootstrapping()
  .startup(async (app: NestExpressApplication, useExpressMiddleware: (app: NestExpressApplication) => void) => {
    useExpressMiddleware(app);
    // 获取 express 实例
    const express = app.getHttpAdapter().getInstance();
    // 创建浏览器刷新服务
    const reloadServer = await reload(express);
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
  })
  .catch((error) => console.error('Bootstrapping Error: ' + error));
