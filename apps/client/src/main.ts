import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as chalk from 'chalk';
import * as hbs from 'hbs';
import * as hbsUtils from 'hbs-utils';
import { join } from 'path';
import * as reload from 'reload';
import * as webpack from 'webpack';
import * as webpackDevConfig from '../webpack/webpack.dev.config';
import { Bootstrapping } from './bootstrapping';
import { environment } from './environments/environment';

new Bootstrapping()
  .startup(async (app: NestExpressApplication) => {
    reload(app.getHttpAdapter().getInstance())
      .then((reloadServer: { reload: () => void }) => {
        webpack(webpackDevConfig, (err?: Error) => {
          // 配置出错，显示错误信息
          if (err) {
            console.error(chalk.red(`[Webpack ValidationError]`), err.message, err.stack);
          }
          reloadServer && reloadServer.reload();
          console.log(chalk.yellow(`[ViewsRenderMiddleware]`), chalk.blue(` Browser refresh in progress...`));
        });
        hbsUtils(hbs).registerWatchedPartials(
          join(__dirname, 'views'),
          {
            onchange() {
              // Partials has changed!
              console.log(`Partials has changed!`);
              reloadServer && reloadServer.reload();
            },
          },
          () => {
            // The initial registration of partials is complete.
            console.log(`The initial registration of partials is complete`);
          }
        );
      })
      .catch((err: unknown) => {
        Logger.error(`NestCNode reload Run！Error: ${err}}`);
      });
  })
  .catch(() => {
    Logger.error(
      `NestCNode Run！port at ${process.env.PORT}, env: ${environment.production ? 'production' : 'development'}`
    );
  });
