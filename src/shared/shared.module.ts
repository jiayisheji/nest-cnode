import { Module } from '@nestjs/common';
import { MongodbModule } from './mongodb/mongodb.module';
@Module({
  imports: [MongodbModule],
  exports: [MongodbModule],
})
export class SharedModule {}