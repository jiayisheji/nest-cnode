import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

import { Request, Response, NextFunction } from 'express';

import * as passport from 'passport';

import * as cookieParser from 'cookie-parser';
import * as RedisClient from 'ioredis';
import * as expressSession from 'express-session';
import * as connectRedis from 'connect-redis';
import * as csurf from 'csurf';
import * as ejsMate from 'ejs-mate';
import * as loaderConnect from 'loader-connect';
import * as flash from 'connect-flash';
import { RedisConfig, EnvironmentConfig } from '../config';
import { join, resolve } from 'path';

export default (app: NestExpressApplication) => {
    const configService = app.get(ConfigService);

    const environment = configService.get<EnvironmentConfig>('environment');
    const dir = environment.isDevelopment ? 'src' : 'dist';
    const rootDir = resolve(process.cwd(), dir);

    // 注意：这个要在express.static之前调用，loader2.0之后要使用loader-connect
    // 自动转换less为css
    if (environment.isDevelopment) {
        app.use(loaderConnect.less(rootDir));
    }
    // prefix 所有的静态文件路径添加前缀"/assets", 需要使用“挂载”功能
    app.useStaticAssets(join(rootDir, 'assets'), {
        prefix: '/assets',
    });
    // 指定视图引擎 处理.html后缀文件
    app.engine('html', ejsMate);
    // 视图引擎
    app.set('view engine', 'html');
    // 配置模板（视图）的基本目录
    app.setBaseViewsDir(join(rootDir, 'views'));

    // 链接Redis
    const RedisStore = connectRedis(expressSession);
    const secret = environment.session_secret;
    // 注册session中间件
    app.use(expressSession({
        name: 'jiayi',
        secret,  // 用来对 session id 相关的 cookie 进行签名
        store: new RedisStore({ client: new RedisClient(configService.get<RedisConfig>('redis')) }),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
        saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
        resave: false,  // 是否每次都重新保存会话，建议false
    }));
    // 注册cookies中间件
    app.use(cookieParser(secret));

    // 注册passport中间件
    app.use(passport.initialize());
    app.use(passport.session());

    // 注册消息中间件
    app.use(flash());

    // 防止跨站请求伪造
    app.use(csurf({ cookie: true }));
    // 设置变量 csrf 保存csrfToken值
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.locals.csrf = req.csrfToken ? req.csrfToken() : '';
        next();
    });
};
