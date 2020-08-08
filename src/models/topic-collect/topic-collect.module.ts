import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModelModule } from '../user';
import { TopicCollect } from './topic-collect.model';
import { TopicCollectRepository } from './topic-collect.repository';

@Module({
  imports: [
    UserModelModule,
    MongooseModule.forFeature([
      { name: TopicCollect.modelName, schema: TopicCollect.schema },
    ]),
  ],
  providers: [TopicCollectRepository],
  exports: [TopicCollectRepository],
})
export class TopicCollectModelModule {}
