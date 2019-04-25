import { Request, Response, NextFunction } from 'express';

/** 扩展请求方法 */
export interface TRequest extends Request {
    session: {
        cookie: {
            path: string,
            _expires: number,
            originalMaxAge: number,
            httpOnly: boolean,
            [key: string]: any;
        },
        error: string,
        passport: {
            user: {
                error?: string;
                [key: string]: any;
            },
        },
        [key: string]: any;
    };
    csrfToken?: () => string;
    flash?: (type: string, msg?: string) => string;
}

/** 扩展响应方法 */
export interface TResponse extends Response {
}

/** 扩展传递函数方法 */
export interface TNext extends NextFunction {
}