import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeatureModule } from './feature/feature.module';
import { CoreModule } from './core/core.module';
import { CurrentUserMiddleware, LocalsMiddleware } from './core/middlewares';

@Module({
  imports: [
    CoreModule,
    FeatureModule,
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
