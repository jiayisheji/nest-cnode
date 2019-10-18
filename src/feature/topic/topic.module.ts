import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { SharedModule } from '../../shared';

@Module({
    imports: [SharedModule],
    providers: [
        TopicService,
    ],
    controllers: [TopicController],
})
export class TopicModule { }