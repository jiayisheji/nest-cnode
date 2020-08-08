import { Controller, Get, Logger, Render, UseGuards } from '@nestjs/common';
import { UserGuard } from 'src/core';
import { ViewsPath } from 'src/core/enums';
import { MessageService } from './message.service';

@Controller('/messages')
export class MessageController {
  private readonly logger = new Logger(MessageController.name, true);
  constructor(private readonly messageService: MessageService) {}

  /** 用户个人的所有消息页 */
  @Get()
  @Render(ViewsPath.MessageIndex)
  @UseGuards(new UserGuard())
  async index() {
    return await this.messageService.index();
  }
}
