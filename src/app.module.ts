import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  AuthModule,
  MessageModule,
  ReplyModule,
  TopicModule,
  UploadModule,
  UserModule,
} from './controllers';
import { CoreModule, CurrentUserMiddleware, LocalsMiddleware } from './core';
import { TopicModelModule, UserModelModule } from './models';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UploadModule,
    TopicModule,
    TopicModelModule,
    UserModelModule,
    ReplyModule,
    MessageModule,
    UserModule,
    CacheModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware, LocalsMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
