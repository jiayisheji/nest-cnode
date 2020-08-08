import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { BaseRepository } from '../base.repository';
import { ReplyRepository } from '../reply';
import { ModelPartial } from '../repository';
import { UserRepository } from '../user';
import { Topic } from './topic.model';

/**
 * 帖子实体
 */
export type TopicEntity = DocumentType<Topic>;
/**
 * 帖子模型
 */
export type TopicModel = ReturnModelType<typeof Topic>;
/**
 * 帖子模型名称
 */
export const TopicModelName = Topic.modelName;

@Injectable()
export class TopicRepository extends BaseRepository<Topic> {
  constructor(
    @InjectModel(TopicModelName) private readonly _topicModel: TopicModel,
    private readonly userRepository: UserRepository,
    private readonly replyRepository: ReplyRepository,
  ) {
    super(_topicModel);
  }

  async save({ title, content, tab, author_id }: ModelPartial<Topic>) {
    const topic = this.create();
    topic.title = title;
    topic.content = content;
    topic.tab = tab;
    topic.author_id = TopicRepository.toObjectId(author_id);
    return super.save(topic);
  }

  /**
   * 更新主题的最后回复信息
   * @param {String} topicId 主题ID
   * @param {String} replyId 回复ID
   */
  updateLastReply(topicId: string, replyId: string) {
    const update = {
      last_reply: replyId,
      last_reply_at: new Date(),
      $inc: {
        reply_count: 1,
      },
    };
    return this.update(topicId, update);
  }

  /**
   * 根据关键词，获取主题列表
   * @param query 搜索关键词
   * @param opt 搜索选项
   */
  async getTopicsByQuery(query, opt) {
    query.deleted = false;
    const topics = await this.find({}, {}, {});

    if (topics.length === 0) {
      return [];
    }

    return topics.reduce(async (previousPromise, topic) => {
      const collection = await previousPromise;
      const [author] = await Promise.all([
        // 获取主题的用户
        this.userRepository.findOne(topic.author_id),
        // 获取主题的最后回复
        // this.service.reply.getReplyById(topic.last_reply),
      ]);

      // 删除不合规的 topic
      if (author) {
        collection.push({
          ...topic.toJSON(),
          author,
        });
      } else {
        collection.push(topic);
      }
      return collection;
    }, Promise.resolve([]));
  }

  /**
   * 将当前主题的回复计数减1，并且更新最后回复的用户，删除回复时用到
   * @param id 主题ID
   */
  async reduceCount(id: string | Types.ObjectId) {
    const update = { $inc: { reply_count: -1 }, last_reply: null };
    const reply = await this.replyRepository.getLastReplyByTopId(id);

    if (reply) {
      update.last_reply = reply.id;
    }
    const opts = { new: true };
    return await this.update(id, update, opts);
  }
}
