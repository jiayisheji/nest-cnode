import { Module } from '@nestjs/common';
import {
  ReplyModelModule,
  TopicModelModule,
  UserModelModule,
} from 'src/models';
import { AddReplyController, ReplyController } from './reply.controller';
import { ReplyService } from './reply.service';

@Module({
  imports: [ReplyModelModule, TopicModelModule, UserModelModule],
  providers: [ReplyService],
  controllers: [AddReplyController, ReplyController],
})
export class ReplyModule {}
