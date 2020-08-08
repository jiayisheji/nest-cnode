import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';
import 'reflect-metadata';
import { isString } from 'util';
import { VALIDATOR_FILTER } from '../constants/validator-filter.constants';
import { ValidatorFilterContext } from '../decorators/validator-filter.decorators';
import { ViewsPath } from '../enums';

interface Render {
  view: string;
  locals: {
    error: string;
    [key: string]: any;
  };
}

const validationErrorMessage = (messages: ValidationError[]): Render => {
  const message: ValidationError = messages[0];
  const metadata: ValidatorFilterContext = Reflect.getMetadata(
    VALIDATOR_FILTER,
    message.target.constructor,
  );
  if (!metadata) {
    throw Error('context is not undefined, use @ValidatorFilter(context)');
  }
  // 处理错误消息显示
  const priorities = metadata.priority[message.property] || [];
  let error = '';
  const notFound = priorities.some(key => {
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
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const request: Request = ctx.getRequest();
    const status = exception.getStatus();
    const message = exception.message?.message ?? exception.message;
    switch (status) {
      case HttpStatus.BAD_REQUEST: // 如果错误码 400
        // 处理aip请求错误
        if (isString(message)) {
          response.status(200).json({
            success: false,
            message,
          });
          break;
        }
        // 处理带模板的请求错误
        const render = validationErrorMessage(message);
        response.render(render.view, render.locals);
        break;
      case HttpStatus.UNAUTHORIZED: // 如果错误码 401
        request.flash('loginError', message || '信息不全。');
        response.redirect('/login');
        break;
      case HttpStatus.FORBIDDEN: // 如果错误码 403
        // 抛出此异常只有两种种情况
        // 路由守卫 需要特殊处理
        // 直接调用 ForbiddenException 对象

        // 使用 ForbiddenException(错误消息，错误类型)
        const user = request.user;
        const error = exception.message.error;
        switch (error) {
          case 'UserGuard': // 如果是用户直接简单粗暴
            response.send('forbidden!');
            break;
          case 'AdminGuard': // 如果是管理员友好提示一下 他可能是一个普通用户
            let errorMessage = '你还没有登录。';
            if (user && !user['is_admin']) {
              errorMessage = '需要管理员权限。';
            }
            response.render(ViewsPath.Notify, { error: errorMessage });
            break;
          default:
            response.render(ViewsPath.Notify, { error: message });
            break;
        }
        break;
      case HttpStatus.NOT_FOUND: // 如果错误码 404
        response.render(ViewsPath.Notify, { error: message });
        break;
      default:
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          message,
        });
        break;
    }
  }
}
