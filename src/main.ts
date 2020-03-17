import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

import setupApp from './core/setup/index';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // 初始化nest
  app.init();
  // 建立app配置
  setupApp(app);
  // 启动服务
  await app.listen(configService.get<number>('environment.port'), configService.get<string>('environment.host'));
}
bootstrap().catch(console.error);
