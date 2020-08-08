import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { BaseRepository } from '../base.repository';
import { ReplyRepository } from '../reply';
import { Reply } from '../reply/reply.model';
import { ModelPartial } from '../repository';
import { TopicRepository } from '../topic';
import { Topic } from '../topic/topic.model';
import { UserRepository } from '../user';
import { User } from '../user/user.model';
import { Message } from './message.model';

/**
 * 帖子实体
 */
export type MessageEntity = DocumentType<Message>;
/**
 * 帖子模型
 */
export type MessageModel = ReturnModelType<typeof Message>;
/**
 * 帖子模型名称
 */
export const MessageModelName = Message.modelName;

/**
 * type:
 * - reply: xx 回复了你的话题
 * - reply2: xx 在话题中回复了你
 * - follow: xx 关注了你
 * - at: xx ＠了你
 */
export const enum MessageType {
  Reply = 'reply',
  Reply2 = 'reply2',
  Follow = 'follow',
  At = 'at',
}

@Injectable()
export class MessageRepository extends BaseRepository<Message> {
  constructor(
    @InjectModel(MessageModelName) private readonly _messageModel: MessageModel,
    private readonly userRepository: UserRepository,
    private readonly topicRepository: TopicRepository,
    private readonly replyRepository: ReplyRepository,
  ) {
    super(_messageModel);
  }

  async save({
    type,
    master_id,
    topic_id,
    author_id,
    reply_id,
  }: ModelPartial<Message>) {
    const message = this.create();
    message.type = type;
    message.master_id = MessageRepository.toObjectId(master_id);
    message.author_id = MessageRepository.toObjectId(topic_id);
    message.topic_id = MessageRepository.toObjectId(author_id);
    message.reply_id = MessageRepository.toObjectId(reply_id);
    return super.save(message);
  }

  /**
   * 将单个消息设置成已读
   * @param id 消息 ID
   */
  async updateOneMessageToRead(id: string) {
    return super.update(id, { $set: { has_read: true } } as any);
  }

  /**
   * 将消息设置成已读
   */
  async updateMessagesToRead(master_id: string, messages: Message[]) {
    if (messages.length === 0) {
      return;
    }

    const ids = messages.map(function(m) {
      return m.id;
    });

    const query = { master_id, _id: { $in: ids } };
    const update = { $set: { has_read: true } };
    const opts = { multi: true };

    return super.find(query, update as any, opts as any);
  }

  /**
   * 根据用户ID，获取已读消息列表
   * @param master_id 用户ID
   */
  async getReadMessagesByUserId(master_id: string) {
    return super.find({ master_id, has_read: true }, null, {
      sort: '-create_at',
      limit: 20,
    });
  }

  /**
   * 根据用户ID，获取未读消息列表
   * @param master_id 用户ID
   */
  async getUnreadMessagesByUserId(master_id: string) {
    return super.find({ master_id, has_read: true }, null, {
      sort: '-create_at',
      limit: 20,
    });
  }

  /**
   * 根据用户ID，获取未读消息的数量
   * @param master_id 用户ID
   */
  getMessagesCount(master_id: string) {
    return super.count({
      master_id,
      has_read: false,
    });
  }

  /**
   * 消息关系
   * @param doc
   */
  async getMessageRelations(doc: Message) {
    if (['reply', 'reply2', 'at'].includes(doc.type)) {
      const [author, topic, reply] = await Promise.all([
        await this.userRepository.findOne(doc.author_id),
        await this.topicRepository.findOne(doc.topic_id),
        await this.replyRepository.findOne(doc.reply_id),
      ]);

      const message = doc as any;

      message.author = author;
      message.topic = topic;
      message.reply = reply;

      if (!author || !topic) {
        message.is_invalid = true;
      }

      return message as Message & {
        author: User;
        topic: Topic;
        reply: Reply;
      };
    }

    return { is_invalid: true };
  }

  /**
   * 根据消息Id获取消息
   * @param id 消息ID
   */
  async getMessageById(id: string) {
    const message = await super.findOne(id);
    return this.getMessageRelations(message);
  }
}
