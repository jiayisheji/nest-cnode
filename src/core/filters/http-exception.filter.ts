import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request, NextFunction } from 'express';
import 'reflect-metadata';
import { ValidationError } from 'class-validator';
import { VALIDATOR_FILTER } from '../constants/validator-filter.constants';
import { ValidatorFilterContext } from 'core';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: Response  = ctx.getResponse();
        const request: Request = ctx.getRequest();
        const status = exception.getStatus();
        switch (status) {
            case HttpStatus.BAD_REQUEST: // 如果错误码 400
                const render = validationErrorMessage(exception.message.message);
                response.render(render.view, render.locals);
                break;
            default:
                console.log(exception.message);
                response
                    .status(status)
                    .json({
                        statusCode: status,
                        timestamp: new Date().toISOString(),
                        path: request.url,
                    });
                break;
        }
    }
}

interface Render {
    view: string;
    locals: {
        error: string;
        [key: string]: any;
    };
}

function validationErrorMessage(messages: ValidationError[]): Render {
    const message: ValidationError = messages[0];
    const metadata: ValidatorFilterContext = Reflect.getMetadata(VALIDATOR_FILTER, message.target.constructor);
    if (!metadata) {
        throw Error('context is not undefined, use @ValidatorFilter(context)');
    }
    // 处理错误消息显示
    const priorities = metadata.priority[message.property];
    let error = '';
    const notFound = priorities.some((key) => {
        key = key.replace(/\b(\w)(\w*)/g, ($0, $1, $2) => {
            return $1.toLowerCase() + $2;
        });
        if (!!message.constraints[key]) {
            error = message.constraints[key];
            return true;
        }
    });
    // 没有找到对应错误消息，取第一个
    if (!notFound) {
        error = message.constraints[Object.keys(message.constraints)[0]];
    }
    // 处理错误以后显示数据
    const locals = Object.keys(metadata.locals).reduce((obj, key) => {
        if (metadata.locals[key]) {
            obj[key] = message.target[key];
        }
        return obj;
    }, {});

    return {
        view: metadata.render,
        locals: {
            error,
            ...locals,
        },
    };
}