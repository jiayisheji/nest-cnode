import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MessageRepository, UserEntity } from 'src/models';

@Injectable({ scope: Scope.REQUEST })
export class MessageService {
  private readonly logger = new Logger(MessageService.name, true);
  constructor(
    private readonly messageRepository: MessageRepository,
    @Inject(REQUEST) private request: Request,
  ) {}

  async index() {
    const { id: userId } = this.request.user as UserEntity;
    const [readMessageResults, unReadMessageResults] = await Promise.all([
      this.messageRepository.getReadMessagesByUserId(userId),
      this.messageRepository.getUnreadMessagesByUserId(userId),
    ]);

    /** 获取 */
    const has_read_messages = await Promise.all(
      readMessageResults.map(
        async message =>
          await this.messageRepository.getMessageRelations(message.toJSON()),
      ),
    );
    const hasnot_read_messages = await Promise.all(
      unReadMessageResults.map(
        async message =>
          await this.messageRepository.getMessageRelations(message.toJSON()),
      ),
    );

    // 把未读消息全部设置成已读
    await this.messageRepository.updateMessagesToRead(
      userId,
      unReadMessageResults,
    );

    return {
      has_read_messages,
      hasnot_read_messages,
    };
  }
}
