import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TopicDbModule } from './topic/topic.module';

@Module({
  imports: [UserModule, TopicDbModule],
  exports: [UserModule, TopicDbModule],
})
export class MongodbModule { }
