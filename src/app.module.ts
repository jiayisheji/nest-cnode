import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule, CurrentUserMiddleware, LocalsMiddleware } from './core';
import { AuthModule, UploadModule } from './controllers';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UploadModule,
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
