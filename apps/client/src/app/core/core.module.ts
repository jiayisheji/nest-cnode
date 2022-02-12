import { databaseConfig, databaseSchema } from '@nest-cnode/server-config';
import { DatabaseModule } from '@nest-cnode/server-model';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as joi from 'joi';

@Module({
  imports: [
    // 环境配置
    ConfigModule.forRoot({
      load: [databaseConfig],
      validationSchema: joi.object().append(databaseSchema),
      ignoreEnvFile: false,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
    }),
    // 数据库配置
    DatabaseModule,
  ],
  providers: [],
})
export class CoreModule {}
