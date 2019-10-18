import { Module } from '@nestjs/common';
import { TopicDbService } from './topic.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TopicSchema } from './topic.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Topic', schema: TopicSchema }]),
  ],
  providers: [TopicDbService],
  exports: [TopicDbService],
})
export class TopicDbModule { }
