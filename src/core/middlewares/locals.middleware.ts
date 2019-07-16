import { Injectable, NestMiddleware, MiddlewareFunction } from '@nestjs/common';
import * as loader from 'loader';
import { ConfigService } from 'core/config';
import { TRequest, TResponse, TNext } from 'shared';

@Injectable()
export class LocalsMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) { }
  resolve(): MiddlewareFunction {
    let assets = {};
    if (this.configService.get('env.MINI_ASSETS')) {
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
    return (req: TRequest, res: TResponse, next: TNext) => {
      // 应用配置
      res.locals.config = this.configService.get('app');
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
    };
  }
}
