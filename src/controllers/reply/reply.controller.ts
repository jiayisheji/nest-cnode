import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UserGuard } from 'src/core';
import { ViewsPath } from 'src/core/enums';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';
import { ReplyService } from './reply.service';

@Controller()
export class AddReplyController {
  private readonly logger = new Logger(AddReplyController.name, true);
  constructor(
    private readonly replyService: ReplyService,
    private readonly config: ConfigService,
  ) {}

  /** 提交一级回复 */
  @Post(':id/reply')
  @UseGuards(new UserGuard())
  async create(
    @Param('id') id: string,
    @Body() create: CreateDto,
    @Res() res: Response,
  ) {
    const reply = await this.replyService.create(id, create);
    res.redirect(`/topic/${reply.topic_id}#${reply.id}`);
  }
}

@Controller('reply')
export class ReplyController {
  private readonly logger = new Logger(ReplyController.name, true);
  constructor(
    private readonly replyService: ReplyService,
    private readonly config: ConfigService,
  ) {}

  /** 修改自己的评论页 */
  @Get(':id/edit')
  @Render(ViewsPath.ReplyEdit)
  @UseGuards(new UserGuard())
  async updateView(@Param('id') id: string) {
    return await this.replyService.updateView(id);
  }

  /** 修改某评论 */
  @Post(':id/edit')
  @Render(ViewsPath.ReplyEdit)
  @UseGuards(new UserGuard())
  async update(
    @Param('id') id: string,
    @Body() update: UpdateDto,
    @Res() res: Response,
  ) {
    const reply = await this.replyService.update(id, update);
    res.redirect(`/topic/${reply.topic_id}#${reply.id}`);
  }

  /** 删除某评论 */
  @Post(':id/delete')
  @UseGuards(new UserGuard())
  async delete(@Param('id') id: string) {
    return this.replyService.delete(id);
  }

  /** 为评论点赞 */
  @Post(':id/up')
  @UseGuards(new UserGuard())
  async up(@Param('id') id: string) {
    return await this.replyService.up(id);
  }
}
