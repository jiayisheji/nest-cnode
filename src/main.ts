import { NestFactory } from '@nestjs/core';

import { join } from 'path';
import * as express from 'express';
import * as ejsMate from 'ejs-mate';
import * as loaderConnect from 'loader-connect';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isDevelopment = true;
  // 根目录 nest-cnode
  const rootDir = join(__dirname, '..');
  // 注意：这个要在express.static之前调用，loader2.0之后要使用loader-connect
  // 自动转换less为css
  if (isDevelopment) {
    app.use(loaderConnect.less(rootDir));
  }
  // 所有的静态文件路径都前缀"/static", 需要使用“挂载”功能
  app.use('/public', express.static(join(rootDir, 'public')));
  // 官方指定是这个 默认访问根目录
  // app.useStaticAssets(join(__dirname, '..', 'public'));
  // 指定视图引擎 处理.html后缀文件
  app.engine('html', ejsMate);
  // 视图引擎
  app.set('view engine', 'html');
  // 配置模板（视图）的基本目录
  app.setBaseViewsDir(join(rootDir, 'views'));
  await app.listen(3000);
}
bootstrap();
