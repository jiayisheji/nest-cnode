import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HomeDto } from './app-home.dto';
import { TopicRepository } from './models';
import moment = require('moment');

@Injectable()
export class AppService {
  constructor(
    private readonly topicRepository: TopicRepository,
    private readonly config: ConfigService,
  ) {}

  async getHome(homeDto: HomeDto): Promise<any> {
    const page = parseInt(homeDto.page, 10) || 1;
    const tab = homeDto.tab || 'all';

    // 取主题
    const query: any = {};
    if (!tab || tab === 'all') {
      query.tab = {
        $nin: ['job', 'dev'],
      };
    } else {
      if (tab === 'good') {
        query.good = true;
      } else {
        query.tab = tab;
      }
    }

    if (!query.good) {
      query.create_at = {
        $gte: moment()
          .subtract(1, 'years')
          .toDate(),
      };
    }

    const limit = this.config.get('application.topic.list_count');
    const options = {
      skip: (page - 1) * limit,
      limit,
      sort: '-top -last_reply_at',
    };
    const topics = await this.topicRepository.getTopicsByQuery(query, options);
    // console.log(topics, query, options);
    return Promise.resolve(topics);
  }
}
