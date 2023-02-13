import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as helpers from 'handlebars-helpers';
import * as layouts from 'handlebars-layouts';
import * as hbs from 'hbs';
import { join } from 'path';
import { AppModule } from './app/app.module';

export class Bootstrapping {
  // 通用前缀
  private _globalPrefix: string;

  /**
   * 启动 Nest 应用程序入口
   * @param useExpressMiddleware 启用 Express Middleware
   * @returns
   */
  async startup(
    useExpressMiddleware?: (
      app: INestApplication,
      useExpressMiddleware: (app: INestApplication) => void
    ) => Promise<void>
  ): Promise<NestExpressApplication> {
    // 需要 create 泛型加上 NestExpressApplication 接口，不然有些方法报错
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bodyParser: true,
    });

    // 启用 Nest Global(middleware、exception-filters、pipes、guards、interceptors)
    this.useNestGlobal(app);

    // 启用 Express Middleware
    if (useExpressMiddleware) {
      await useExpressMiddleware(app, this.useExpressMiddleware);
    } else {
      this.useExpressMiddleware(app);
    }

    const port = process.env.PORT || 3333;

    return await app.listen(port, () => {
      Logger.log(`Listening at http://localhost:${port}/`);
    });
  }

  /**
   * 注册全局 Nest 的 middleware、exception-filters、pipes、guards、interceptors
   * @param app
   */
  private useNestGlobal(app: NestExpressApplication): void {
    //
  }

  /**
   * 注册全局 express middleware
   * @param app
   */
  private useExpressMiddleware(app: NestExpressApplication): void {
    // 初始化 handlebars-helpers
    helpers({ handlebars: hbs });
    // 初始化 handlebars-layouts(必须在 handlebars-helpers 后面)
    layouts.register(hbs.handlebars);
    // locals 变量作为模板数据
    hbs.localsAsTemplateData(app);
    // 注册静态资源路径和访问路径前缀
    app.useStaticAssets(join(__dirname));
    // 注册模板引擎路径
    app.setBaseViewsDir(join(__dirname, 'views'));
    // 设置模板引擎
    app.setViewEngine('hbs');
    // 设置模板引擎公共页面
    app.set('view options', { layout: 'layout.hbs' });
  }
}
