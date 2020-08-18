import { Module } from '@nestjs/common';
import {
  ReplyModelModule,
  TopicModelModule,
  UserModelModule,
} from 'src/models';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [UserModelModule, TopicModelModule, ReplyModelModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
