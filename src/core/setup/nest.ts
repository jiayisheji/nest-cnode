import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../filters/http-exception.filter';

export default (app: INestApplication) => {
    // 注册并配置全局验证管道
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
        forbidUnknownValues: true,
    }));
    // 注册全局http异常过滤器
    app.useGlobalFilters(new HttpExceptionFilter());
};