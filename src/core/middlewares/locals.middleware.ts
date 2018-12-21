import { Injectable, NestMiddleware, MiddlewareFunction } from '@nestjs/common';
import * as loader from 'loader';
import { ConfigService, EnvConfig } from 'config';
import { APP_CONFIG } from '../constants';

@Injectable()
export class LocalsMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService<EnvConfig>) {}
  resolve(...args: any[]): MiddlewareFunction {
    let assets = {};
    if (this.configService.get('MINI_ASSETS')) {
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
    return (req, res, next) => {
      res.locals.config = APP_CONFIG;
      res.locals.Loader = loader;
      res.locals.assets = assets;
      next();
    };
  }
}
