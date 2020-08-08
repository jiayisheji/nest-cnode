import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Types } from 'mongoose';
import {
  ReplyRepository,
  TopicCollectEntity,
  TopicCollectRepository,
  TopicRepository,
  UserEntity,
  UserRepository,
} from 'src/models';
import { isObjectId } from 'src/shared';
import { CollectDto } from './dto/collect.dto';
import { CreateDto } from './dto/create.dto';

@Injectable({ scope: Scope.REQUEST })
export class TopicService {
  private readonly logger = new Logger(TopicService.name, true);
  constructor(
    private readonly topicRepository: TopicRepository,
    private readonly userRepository: UserRepository,
    private readonly topicCollectRepository: TopicCollectRepository,
    private readonly replyRepository: ReplyRepository,
    private readonly config: ConfigService,
    @Inject(REQUEST) private request: Request,
  ) {}

  async index(id: string) {
    const user = this.request.user as UserEntity;

    const topic = await this.finIdByTopic(id);

    // 增加 visit_count
    topic.visit_count += 1;
    // 写入 DB
    await this.topicRepository.increment(id, 'visit_count');

    // 根据帖子的作者去查询用户信息和回复信息
    const [author, replies] = await Promise.all([
      await this.userRepository.findOne(topic.author_id.toHexString()),
      await this.replyRepository.getRepliesByTopicId(id),
    ]);

    // 添加作者和回复数据
    topic['author'] = author;

    topic['replies'] = replies;

    let is_collect: null | TopicCollectEntity;
    if (!user) {
      is_collect = null;
    } else {
      // 查询是否已经收藏
      is_collect = await this.topicCollectRepository.findOne({
        topic_id: id,
        user_id: user.id,
      });
    }

    /** 获取作者其他主题 */
    const author_other_topics = await this.topicRepository.find(
      { author_id: topic.author_id, _id: { $nin: [topic.id] } } as any,
      null,
      { limit: 5, sort: '-last_reply_at' },
    );

    function is_uped(user, reply) {
      if (!reply.ups) {
        return false;
      }
      return reply.ups.indexOf(user._id) !== -1;
    }

    return {
      is_uped,
      topic,
      is_collect,
      author_other_topics,
      replies: [],
    };
  }

  async create(create: CreateDto) {
    const { id: author_id } = this.request.user as UserEntity;
    // 储存新主题帖
    const topic = this.topicRepository.save({
      author_id,
      title: create.title,
      content: create.content,
      tab: create.tab,
    });
    return topic;
  }
  /**
   * 显示编辑页面
   */
  async updateView(id: string) {
    const user = this.request.user as UserEntity;

    const topic = await this.finIdByTopic(id);

    // 检查是否有权限编辑主题
    // 只有发送者和管理员才能编辑
    if (this.validateUser(user, topic.author_id)) {
      return {
        action: 'edit',
        topic_id: topic.id,
        title: topic.title,
        content: topic.content,
        tab: topic.tab,
        tabs: this.config.get('application.tabs'),
      };
    }
    // 直接抛出异常
    throw new ForbiddenException('对不起，你不能编辑此话题');
  }
  /**
   * 更新主题帖
   */
  async update(id: string, update: CreateDto) {
    const topic = await this.finIdByTopic(id);
    // 保存话题
    topic.title = update.title;
    topic.content = update.content;
    topic.tab = update.tab;
    topic.updated_at = new Date();
    return await topic.save();
  }

  /**
   * 设为置顶
   */
  async top(id: string) {
    const referer = this.request.get('referer');

    const topic = await this.finIdByTopic(id);

    topic.top = !topic.top;
    await topic.save();
    const success = topic.lock ? '此话题已置顶。' : '此话题已取消置顶。';
    return { success, referer };
  }

  /**
   * 设为精华
   */
  async good(id: string) {
    const referer = this.request.get('referer');

    const topic = await this.finIdByTopic(id);

    topic.good = !topic.good;
    await topic.save();
    const success = topic.lock ? '此话题已加精。' : '此话题已取消加精。';
    return { success, referer };
  }
  /**
   * 锁定帖子,不能回复
   */
  async lock(id: string) {
    const referer = this.request.get('referer');

    const topic = await this.finIdByTopic(id);

    topic.lock = !topic.lock;
    await topic.save();
    const success = topic.lock ? '此话题已锁定。' : '此话题已取消锁定。';
    return { success, referer };
  }

  /**
   * 删除主题帖
   */
  async delete(id: string) {
    // 删除话题, 话题作者topic_count减1
    // 删除回复，回复作者reply_count减1
    // 删除topic_collect，用户collect_topic_count减1
    const user = this.request.user as UserEntity;
    const topic = await this.finIdByTopic(id);
    // 根据帖子的作者去查询用户信息
    const author = await this.userRepository.findOne(topic.author_id);
    // 只有管理员和当前用户才能删除
    if (!this.validateUser(user, topic.author_id)) {
      return new ForbiddenException({ message: '无权限', success: false });
    }
    // 减去积分 主题数量 更新用户
    author.score -= 5;
    author.topic_count -= 1;
    await author.save();
    // 软删除（只是标记删除） 更新主题
    await this.topicRepository.remove(id);
    // 返回成功信息
    return { message: '话题已被删除。', success: true };
  }

  async collect(collect: CollectDto) {
    const { id: user_id } = this.request.user as UserEntity;
    const { topic_id } = collect;
    // 优先验证id合法性 然后再去查询数据库
    if (!isObjectId(topic_id)) {
      return { status: 'failed' };
    }
    // 查询帖子数据
    const topic = await this.topicRepository.findOne(topic_id);
    // 找不到直接返回错误
    if (!topic) {
      return { status: 'failed' };
    }

    // 查询是否已经收藏
    const doc = await this.topicCollectRepository.findOne({
      topic_id,
      user_id,
    });
    if (doc) {
      return { status: 'failed' };
    }
    // 创建主题收藏记录
    await this.topicCollectRepository.save({
      topic_id,
      user_id,
    });
    // 更新主题收藏数和用户收藏数
    await Promise.all([
      this.userRepository.increment(user_id, 'collect_topic_count'),
      this.topicRepository.increment(topic_id, 'collect_count'),
    ]);
    // 返回成功信息
    return { status: 'success' };
  }

  async deCollect(collect: CollectDto) {
    const currentUser = this.request.user as UserEntity;
    const { topic_id } = collect;
    // 优先验证id合法性 然后再去查询数据库
    if (!isObjectId(topic_id)) {
      return { status: 'failed' };
    }
    // 查询帖子数据
    const topic = await this.topicRepository.findOne(topic_id);
    // 找不到直接返回错误
    if (!topic) {
      return { status: 'failed' };
    }
    // 删除主题收藏
    const removeResult = await this.topicCollectRepository.delete({
      topic_id,
      user_id: currentUser.id,
    });

    if (removeResult.n === 0) {
      return { status: 'failed' };
    }

    // 更新当前用户收藏信息
    // 当前用户关注主题-1
    await this.userRepository.decrement(currentUser.id, 'collect_topic_count');

    // 当前主题关注数-1
    topic.collect_count -= 1;
    await topic.save();
    // 返回成功信息
    return { status: 'success' };
  }

  /**
   * 根据id获取主题 并处理异常
   * @param id 主题id
   */
  private async finIdByTopic(id: string) {
    // 优先验证id合法性 然后再去查询数据库
    if (!isObjectId(id)) {
      throw new NotFoundException('此话题不存在或已被删除。');
    }
    // 查询帖子数据
    const topic = await this.topicRepository.findOne(id);
    // 找不到直接返回错误
    if (!topic) {
      throw new NotFoundException('此话题不存在或已被删除。');
    }
    return topic;
  }

  private validateUser(user: UserEntity, id: string | Types.ObjectId): boolean {
    return user.id.toString() === id.toString() || user['is_admin'];
  }
}
