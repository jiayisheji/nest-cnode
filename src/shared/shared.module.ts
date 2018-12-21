import { Module } from '@nestjs/common';
import { MongodbModule } from './mongodb/mongodb.module';
import { ServicesModule } from './services/services.module';
@Module({
  imports: [MongodbModule, ServicesModule],
  exports: [MongodbModule, ServicesModule],
})
export class SharedModule {}