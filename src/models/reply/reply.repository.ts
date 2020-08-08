import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { BaseRepository } from '../base.repository';
import {
  FindConditions,
  FindOneOptions,
  ModelPartial,
  Projection,
} from '../repository';
import { UserRepository } from '../user';
import { Reply } from './reply.model';

/**
 * 帖子实体
 */
export type ReplyEntity = DocumentType<Reply>;
/**
 * 帖子模型
 */
export type ReplyModel = ReturnModelType<typeof Reply>;
/**
 * 帖子模型名称
 */
export const ReplyModelName = Reply.modelName;

@Injectable()
export class ReplyRepository extends BaseRepository<Reply> {
  constructor(
    @InjectModel(ReplyModelName) private readonly _replyModel: ReplyModel,
    private readonly userRepository: UserRepository,
  ) {
    super(_replyModel);
  }

  async save({ content, topic_id, author_id, reply_id }: ModelPartial<Reply>) {
    const reply = this.create();
    reply.topic_id = ReplyRepository.toObjectId(topic_id);
    reply.content = content;
    reply.reply_id = ReplyRepository.toObjectId(reply_id);
    reply.author_id = ReplyRepository.toObjectId(author_id);
    return super.save(reply);
  }

  async findOne(
    conditions: string | Types.ObjectId | FindConditions<Reply>,
    projection?: Projection<Reply>,
    options?: FindOneOptions<Reply>,
  ) {
    const reply = await super.findOne(conditions, projection, options);

    if (!reply) {
      return null;
    }

    const author = await this.userRepository.findOne(reply.author_id);

    reply['author'] = author;
    // TODO: 添加更新方法，有些旧帖子可以转换为markdown格式的内容
    if (reply.content_is_html) {
      return reply;
    }

    return reply;
  }

  /*
   * 根据主题ID，获取回复列表
   * Callback:
   * - err, 数据库异常
   * - replies, 回复列表
   * @param {String} id 主题ID
   * @return {Promise[replies]} 承载 replay 列表的 Promise 对象
   */
  async getRepliesByTopicId(topic_id: string) {
    let replies = await super.find({ topic_id, deleted: false }, null, {
      sort: 'create_at',
    });

    if (replies.length === 0) {
      return [];
    }

    replies = replies.filter(function(item) {
      return !item.content_is_html;
    });

    return Promise.all(
      replies.map(async item => {
        const author = await this.userRepository.findOne(
          item.author_id.toHexString(),
        );

        // item.content = await this.service.at.linkUsers(item.content);
        return {
          ...item.toJSON(),
          author: author || { _id: '' },
          content: item.content,
        };
      }),
    );
  }

  /**
   * 根据topicId查询到最新的一条未删除回复
   * @param topicId 主题ID
   */
  async getLastReplyByTopId(topic_id: string | Types.ObjectId) {
    const query = { topic_id, deleted: false };
    const opts = { sort: { created_at: -1 }, limit: 1 };
    return await super.find(query, '_id', opts)[0];
  }
}
