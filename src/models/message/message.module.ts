import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReplyModelModule } from '../reply';
import { TopicModelModule } from '../topic';
import { UserModelModule } from '../user';
import { Message } from './message.model';
import { MessageRepository } from './message.repository';

@Module({
  imports: [
    UserModelModule,
    TopicModelModule,
    ReplyModelModule,
    MongooseModule.forFeature([
      { name: Message.modelName, schema: Message.schema },
    ]),
  ],
  providers: [MessageRepository],
  exports: [MessageRepository],
})
export class MessageModelModule {}
