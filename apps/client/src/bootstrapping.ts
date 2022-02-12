import { INestApplication, Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import * as passport from 'passport';
import { AppModule } from './app/app.module';

export class Bootstrapping {
  /**
   * 启动 Nest 应用程序入口
   */
  async startup(): Promise<void> {
    // 需要 create 泛型加上 NestExpressApplication 接口，不然有些方法报错
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bodyParser: true,
    });

    const configService = app.get(ConfigService);

    this.useExpressMiddleware(app);
    this.useGlobalNest(app);

    const port = configService.get<number>('application.port') || 3333;

    await app.listen(port, () => {
      Logger.log(`Listening at http://localhost:${port}/`);
    });
  }

  /**
   * 注册全局 Nest 的 middleware、exception-filters、pipes、guards、interceptors
   * @param app
   */
  private useGlobalNest(app: INestApplication): void {
    app.setGlobalPrefix('api', {
      exclude: [''],
    });

    app.enableVersioning({
      type: VersioningType.URI,
    });
  }

  /**
   * 注册全局 express middleware
   * @param app
   */
  private useExpressMiddleware(app: NestExpressApplication): void {
    app.use(cookieParser());
    app.use(bodyParser.json({ limit: '1mb' }));
    app.use(bodyParser.urlencoded({ extended: true }));
    // MARK: keep v0.5 https://github.com/jaredhanson/passport/blob/master/CHANGELOG.md#changed
    app.use(passport.initialize());
    app.use(csurf({ cookie: true }));
  }
}
