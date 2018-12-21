import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeatureModule } from './feature/feature.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    CoreModule,
    FeatureModule,
  ],
  controllers: [AppController],
  providers: [ AppService ],
})
export class AppModule {}
