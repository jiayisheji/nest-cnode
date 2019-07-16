import { Injectable, NestMiddleware, MiddlewareFunction } from '@nestjs/common';
import { TRequest, TResponse, TNext } from 'shared';
import { ConfigService } from 'core/config';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
    constructor() { }
    resolve(): MiddlewareFunction {
        return (req: TRequest, res: TResponse, next: TNext) => {
            // 确保始终定义了current_user
            res.locals.current_user = null;
            const { user } = req;
            if (!user) {
                return next();
            }
            res.locals.current_user = user;
            next();
        };
    }
}