import { Module } from '@nestjs/common';
import { MessageModelModule } from 'src/models';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [MessageModelModule],
  providers: [MessageService],
  controllers: [MessageController],
})
export class MessageModule {}
