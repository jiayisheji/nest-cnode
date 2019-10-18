import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { TopicDbService } from 'shared/mongodb/topic';

@Injectable()
export class TopicService {
    private readonly logger = new Logger(TopicService.name, true);
    constructor(
        private readonly topicDbService: TopicDbService,
    ) { }

}
