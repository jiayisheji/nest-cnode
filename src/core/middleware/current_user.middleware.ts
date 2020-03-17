import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
    constructor() { }
    use(req: Request, res: Response, next: NextFunction) {
        // 确保始终定义了current_user
        res.locals.current_user = null;
        const { user } = req;
        if (!user) {
            return next();
        }
        res.locals.current_user = user;
        next();
    }
}