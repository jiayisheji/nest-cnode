import { Injectable, NestMiddleware, MiddlewareFunction } from '@nestjs/common';
import { ConfigService } from 'config';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
    constructor(private readonly configService: ConfigService) { }
    resolve(...args: any[]): MiddlewareFunction {
        return (req, res, next) => {
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