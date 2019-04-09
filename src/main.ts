import { NestFactory } from '@nestjs/core';

import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import * as expressSession from 'express-session';
import * as connectRedis from 'connect-redis';
import * as csurf from 'csurf';

import * as ejsMate from 'ejs-mate';
import * as loaderConnect from 'loader-connect';

import { AppModule } from './app.module';
import { ConfigService } from 'config';
import { getRedisConfig } from 'tools/get-redis';
import { HttpExceptionFilter } from 'core/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  // 根目录 nest-cnode
  const rootDir = join(__dirname, '..');
  const app = await NestFactory.create(AppModule);
  app.init();
  const config: ConfigService<any> = app.get(ConfigService);

  // 注意：这个要在express.static之前调用，loader2.0之后要使用loader-connect
  // 自动转换less为css
  if (config.isDevelopment) {
    app.use(loaderConnect.less(rootDir));
  }

  // prefix 所有的静态文件路径添加前缀"/static", 需要使用“挂载”功能
  app.useStaticAssets(join(rootDir, 'public'), {
    prefix: '/public',
  });
  // 指定视图引擎 处理.html后缀文件
  app.engine('html', ejsMate);
  // 视图引擎
  app.set('view engine', 'html');
  // 配置模板（视图）的基本目录
  app.setBaseViewsDir(join(rootDir, 'views'));

  // 链接Redis
  const RedisStore = connectRedis(expressSession);
  const secret = config.get('SESSION_SECRET');
  // 注册session中间件
  app.use(expressSession({
    name: 'jiayi',
    secret,  // 用来对 sessionid 相关的 cookie 进行签名
    store: new RedisStore(getRedisConfig(config)),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
    saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
    resave: false,  // 是否每次都重新保存会话，建议false
  }));
  // 注册cookies中间件
  app.use(cookieParser(secret));
  // 防止跨站请求伪造
  app.use(csurf({ cookie: true }));

  // 设置变量 csrf 保存csrfToken值
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.csrf = (req as any).csrfToken ? (req as any).csrfToken() : '';
    next();
  });
  // 注册并配置全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    skipMissingProperties: false,
    forbidUnknownValues: true,
  }));
  // 注册全局http异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  // 启动监听3000端口 浏览器访问 http://localhost:3000
  await app.listen(3000);
}
bootstrap();
