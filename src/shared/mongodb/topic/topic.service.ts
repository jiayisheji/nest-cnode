import { Injectable } from '@nestjs/common';
import { BaseService } from '../base.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topic } from './topic.interface';

@Injectable()
export class TopicDbService extends BaseService<Topic> {
    constructor(
        @InjectModel('Topic') private readonly topicModel: Model<Topic>,
    ) {
        super(topicModel);
    }

    async create(docs: any): Promise<Topic> {
        const topic = await super.create(docs);
        return topic.save();
    }

}
