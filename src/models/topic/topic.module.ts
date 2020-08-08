import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReplyModelModule } from '../reply';
import { UserModelModule } from '../user';
import { Topic } from './topic.model';
import { TopicRepository } from './topic.repository';

@Module({
  imports: [
    UserModelModule,
    ReplyModelModule,
    MongooseModule.forFeature([
      { name: Topic.modelName, schema: Topic.schema },
    ]),
  ],
  providers: [TopicRepository],
  exports: [TopicRepository],
})
export class TopicModelModule {}
