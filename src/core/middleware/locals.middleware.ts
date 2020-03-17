import { Injectable, NestMiddleware } from '@nestjs/common';
import * as loader from 'loader';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LocalsMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) { }
  use(req: Request, res: Response, next: NextFunction) {
    let assets = {};
    if (this.configService.get<boolean>('environment.mini_assets')) {
      try {
        assets = require('../../../assets.json');
      } catch (e) {
        // tslint:disable-next-line:no-console
        console.error(
          'You must execute `make build` before start app when mini_assets is true.',
        );
        throw e;
      }
    }
    // 应用配置
    res.locals.config = this.configService.get('application');
    // 加载文件
    res.locals.Loader = loader;
    // 静态资源
    res.locals.assets = assets;
    // 工具助手
    res.locals.helper = {
      proxy(url: string) {
        return url;
      },
    };
    next();
  }
}
