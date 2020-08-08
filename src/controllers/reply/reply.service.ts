import {
  BadRequestException,
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
  TopicRepository,
  UserEntity,
  UserRepository,
} from 'src/models';
import { isObjectId } from 'src/shared';
import { toObjectId } from './../../shared/utils/objectId';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';

@Injectable({ scope: Scope.REQUEST })
export class ReplyService {
  private readonly logger = new Logger(ReplyService.name, true);
  constructor(
    private readonly topicRepository: TopicRepository,
    private readonly userRepository: UserRepository,
    // private readonly topicCollectRepository: TopicCollectRepository,
    private readonly replyRepository: ReplyRepository,
    private readonly config: ConfigService,
    @Inject(REQUEST) private request: Request,
  ) {}

  /**
   * 创建回复
   * @param id  主题id
   * @param create 回复内容
   */
  async create(topic_id: string, create: CreateDto) {
    const { id: author_id } = this.request.user as UserEntity;
    const { r_content: content, reply_id } = create;
    // 优先验证id合法性 然后再去查询数据库
    if (!isObjectId(topic_id)) {
      throw new NotFoundException('这个主题不存在。');
    }
    // 查询帖子数据
    const topic = await this.topicRepository.findOne(topic_id);
    // 找不到直接返回错误
    if (!topic) {
      throw new NotFoundException('这个主题不存在。');
    }

    // 获取主题作者
    const topicAuthor = await this.userRepository.findOne(
      topic.author_id.toHexString(),
    );
    const newContent = content.replace('@' + topicAuthor.loginname + ' ', '');

    const reply = await this.replyRepository.save({
      content,
      topic_id,
      author_id,
      reply_id: reply_id,
    });

    await Promise.all([
      this.userRepository.increment(author_id, {
        score: 5,
        reply_count: 1,
      }),
      this.topicRepository.updateLastReply(topic_id, reply.id),
    ]);

    return reply;
  }
  /**
   * 显示编辑页面
   * @param id  回复id
   */
  async updateView(id: string) {
    const user = this.request.user as UserEntity;

    const reply = await this.finIdByReply(id);

    // 检查是否有权限编辑回复
    // 只有发送者和管理员才能编辑
    if (this.validateUser(user, reply.author_id)) {
      return {
        reply_id: reply.id,
        content: reply.content,
      };
    }
    // 直接抛出异常
    throw new ForbiddenException('对不起，你不能编辑此回复', '');
  }

  /**
   * 更新回复
   * @param id  回复id
   * @param update 回复内容
   */
  async update(id: string, update: UpdateDto) {
    const user = this.request.user as UserEntity;

    const reply = await this.finIdByReply(id);

    // 检查是否有权限编辑回复
    // 只有发送者和管理员才能编辑
    if (this.validateUser(user, reply.author_id)) {
      reply.content = update.content;
      reply.updated_at = new Date();
      return await this.replyRepository.save(reply as any);
    }
    // 直接抛出异常
    throw new ForbiddenException('对不起，你不能编辑此回复', '');
  }

  /**
   * 删除主题帖
   * @param id  回复id
   */
  async delete(id: string) {
    const user = this.request.user as UserEntity;
    // 优先验证id合法性 然后再去查询数据库
    if (!isObjectId(id)) {
      throw new BadRequestException('no reply ' + id + ' exists');
    }
    // 查询帖子数据
    const reply = await this.replyRepository.findOne(id);

    // 找不到直接返回错误
    if (!reply) {
      throw new BadRequestException('no reply ' + id + ' exists');
    }

    // 检查是否有权限编辑回复
    // 只有发送者和管理员才能编辑
    if (this.validateUser(user, reply.author_id)) {
      // 减去用户回复数
      await this.replyRepository.remove(id);
      reply['author'].score -= 5;
      reply['author'].reply_count -= 1;
      await reply['author'].save();
      // 减去主题回复数
      await this.topicRepository.reduceCount(reply.topic_id);
      return { status: 'success' };
    }
  }

  /**
   * 回复点赞
   * @param id  回复id
   */
  async up(id: string) {
    const { id: user_id } = this.request.user as UserEntity;

    // 优先验证id合法性 然后再去查询数据库
    if (!isObjectId(id)) {
      return {
        success: false,
        message: '此回复不存在或已被删除。',
      };
    }
    // 查询帖子数据
    const reply = await this.replyRepository.findOne(id);

    // 找不到直接返回错误
    if (!reply) {
      return {
        success: false,
        message: '此回复不存在或已被删除。',
      };
    }

    if (reply.author_id.toString() === user_id.toString()) {
      return {
        success: false,
        message: '呵呵，不能帮自己点赞。',
      };
    }

    let action: 'up' | 'down';
    reply.ups = reply.ups || [];
    const upIndex = reply.ups.indexOf(user_id);
    if (upIndex === -1) {
      reply.ups.push(toObjectId(user_id));
      action = 'up';
    } else {
      reply.ups.splice(upIndex, 1);
      action = 'down';
    }
    await reply.save();
    return {
      success: true,
      action,
    };
  }

  /**
   * 根据id获取回复 并处理异常
   * @param id 回复id
   */
  private async finIdByReply(id: string) {
    // 优先验证id合法性 然后再去查询数据库
    if (!isObjectId(id)) {
      throw new NotFoundException('此回复不存在或已被删除。');
    }
    // 查询帖子数据
    const reply = await this.replyRepository.findOne(id);
    // 找不到直接返回错误
    if (!reply) {
      throw new NotFoundException('此话题不存在或已被删除。');
    }
    return reply;
  }

  private validateUser(user: UserEntity, id: string | Types.ObjectId): boolean {
    return user.id.toString() === id.toString() || user['is_admin'];
  }
}
