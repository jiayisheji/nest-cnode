import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import * as sortBy from 'lodash.sortBy';
import {
  ReplyRepository,
  TopicRepository,
  UserEntity,
  UserRepository,
} from 'src/models';
import { encryptMD5 } from 'src/shared';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly topicRepository: TopicRepository,
    private readonly replyRepository: ReplyRepository,
    private readonly config: ConfigService,
    @Inject(REQUEST) private request: Request,
  ) {}

  top100() {
    return this.userRepository.find(
      { is_block: false },
      {},
      { limit: 100, sort: '-score' },
    );
  }

  async settingView() {
    const currentUser = this.request.user as UserEntity;
    const user = await this.userRepository.findOne(currentUser.id);

    if (this.request.query.save === 'success') {
      user['success'] = '保存成功。';
    }

    return { user, pageTitle: '设置' };
  }
  setting() {}

  async stars() {
    return this.userRepository.find({ is_star: true });
  }

  star() {}
  block() {}
  deleteAll() {}

  async home(name: string) {
    const currentUser = this.request.user as UserEntity;
    const user = await this.userRepository.getUserByLoginName(name);

    if (!user) {
      throw new NotFoundException('这个用户不存在。');
    }

    const [recent_topics, replies] = await Promise.all([
      this.topicRepository.getTopicsByQuery(
        { author_id: user._id },
        { limit: 5, sort: '-created_at' },
      ),
      this.replyRepository.getRepliesByAuthorId(user._id, {
        limit: 20,
        sort: '-created_at',
      }),
    ]);

    // 只显示最近5条
    const topic_ids = [
      ...new Set(replies.map(reply => reply.topic_id.toString())),
    ].slice(0, 5);

    let recent_replies = await this.topicRepository.getTopicsByQuery(
      { _id: { $in: topic_ids } },
      {},
    );

    recent_replies = sortBy(recent_replies, topic => {
      return topic_ids.indexOf(topic._id.toString());
    });

    console.log(user);

    user.url = (() => {
      if (user.url && user.url.indexOf('http') !== 0) {
        return 'http://' + user.url;
      }
      return user.url;
    })();

    // 如果用户没有激活，那么管理员可以帮忙激活
    let token = '';
    if (!user.active && currentUser && currentUser['is_admin']) {
      const secret: string = this.config.get('express.secret');
      token = encryptMD5(user.email + user.pass + secret);
    }

    return {
      user,
      token,
      recent_topics,
      recent_replies,
      pageTitle: `@${user.loginname} 的个人主页`,
    };
  }

  listCollectedTopics(name: string) {}

  async listTopics(name: string) {
    const user = await this.userRepository.getUserByLoginName(name);
    const page = 1;
    const limit = 50;
    if (!user) {
      throw new NotFoundException('这个用户不存在。');
    }

    const [topics, count] = await this.topicRepository.findAndCount(
      { author_id: user._id },
      null,
      { skip: (page - 1) * limit, limit, sort: '-created_at' },
    );

    const pages = Math.ceil(count / limit);

    return {
      user,
      topics,
      current_page: 1,
      pages,
    };
  }

  async listReplies(name: string) {
    const user = await this.userRepository.getUserByLoginName(name);
    const page = 1;
    const limit = 50;
    if (!user) {
      throw new NotFoundException('这个用户不存在。');
    }

    const author_id = user._id;

    const replies = await this.replyRepository.getRepliesByAuthorId(author_id, {
      skip: (page - 1) * limit,
      limit,
      sort: '-created_at',
    });
    const topic_ids = [
      ...new Set(
        replies.map(reply => {
          return reply.topic_id.toString();
        }),
      ),
    ];
    // 获取所有有评论的主题
    let topics = await this.topicRepository.getTopicsByQuery(
      { _id: { $in: topic_ids } },
      {},
    );
    topics = sortBy(topics, topic => {
      return topic_ids.indexOf(topic._id.toString());
    });

    const count = await this.replyRepository.count({ author_id });
    const pages = Math.ceil(count / limit);

    return {
      user,
      topics,
      current_page: page,
      pages,
    };
  }
}
