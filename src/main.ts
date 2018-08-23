import { NestFactory } from '@nestjs/core';

import { join } from 'path';
import * as express from 'express';
import * as loaderConnect from 'loader-connect';

import { AppModule } from './app.module';
import { Configuration } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 注意：这个要在express.static之前调用，loader2.0之后要使用loader-connect
  // 自动转换less为css
  app.use(loaderConnect.less(__dirname));
  // 所有的静态文件路径都前缀"/static", 需要使用“挂载”功能
  app.use('/public', express.static(join(__dirname, '..', 'public')));
  // 官方指定是这个 默认访问根目录
  // app.useStaticAssets(join(__dirname, '..', 'public'));
  // 配置模板（视图）的基本目录
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  // 配置视图引擎
  app.setViewEngine('ejs');
  await app.listen(Configuration.getEnv('PORT'));
}
bootstrap();
