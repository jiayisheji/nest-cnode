import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModelModule } from '../user';
import { Reply } from './reply.model';
import { ReplyRepository } from './reply.repository';

@Module({
  imports: [
    UserModelModule,
    MongooseModule.forFeature([
      { name: Reply.modelName, schema: Reply.schema },
    ]),
  ],
  providers: [ReplyRepository],
  exports: [ReplyRepository],
})
export class ReplyModelModule {}
