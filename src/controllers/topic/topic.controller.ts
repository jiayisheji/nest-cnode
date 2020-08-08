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
import { AdminGuard, UserGuard } from 'src/core';
import { ViewsPath } from 'src/core/enums';
import { CollectDto } from './dto/collect.dto';
import { CreateDto } from './dto/create.dto';
import { TopicService } from './topic.service';

@Controller('topic')
export class TopicController {
  private readonly logger = new Logger(TopicController.name, true);
  constructor(
    private readonly topicService: TopicService,
    private readonly config: ConfigService,
  ) {}

  /** 发布话题 */
  @Get('/create')
  @Render(ViewsPath.TopicCreate)
  @UseGuards(new UserGuard())
  async createView() {
    return {
      pageTitle: '发布话题',
      tabs: this.config.get('application.tabs'),
    };
  }

  /** 获取话题 */
  @Get(':id')
  @Render(ViewsPath.TopicIndex)
  async indexView(@Param('id') id: string) {
    return await this.topicService.index(id);
  }

  /** 发布话题 */
  @Post('/create')
  @Render(ViewsPath.TopicCreate)
  @UseGuards(new UserGuard())
  async create(@Body() create: CreateDto, @Res() res: Response) {
    const topic = await this.topicService.create(create);
    res.redirect(`/topic/${topic.id}`);
  }

  /** 编辑某话题 */
  @Get(':id/edit')
  @Render(ViewsPath.TopicCreate)
  @UseGuards(new UserGuard())
  async updateView(@Param('id') id: string) {
    return await this.topicService.updateView(id);
  }

  /** 编辑某话题 */
  @Post(':id/edit')
  @Render(ViewsPath.TopicCreate)
  @UseGuards(new UserGuard())
  async update(
    @Param('id') id: string,
    @Body() create: CreateDto,
    @Res() res: Response,
  ) {
    const topic = await this.topicService.update(id, create);
    res.redirect(`/topic/${topic.id}`);
  }

  /** 将某话题删除 */
  @Post(':id/delete')
  @UseGuards(new UserGuard())
  async delete(@Param('id') id: string) {
    return this.topicService.delete(id);
  }

  /** 将某话题置顶 */
  @Post(':id/top')
  @UseGuards(new AdminGuard())
  async top(@Param('id') id: string, @Res() res: Response) {
    const data = await this.topicService.top(id);
    res.render('notify/notify', data);
  }

  /** 将某话题加精 */
  @Post(':id/good')
  @UseGuards(new AdminGuard())
  async good(@Param('id') id: string, @Res() res: Response) {
    const data = await this.topicService.good(id);
    res.render('notify/notify', data);
  }
  /** 锁定主题，不能再回复 */
  @Post(':id/lock')
  @UseGuards(new AdminGuard())
  async lock(@Param('id') id: string, @Res() res: Response) {
    const data = await this.topicService.lock(id);
    res.render('notify/notify', data);
  }
  /** 关注某话题 */
  @Post('collect')
  @UseGuards(new UserGuard())
  async collect(@Body() collect: CollectDto) {
    return await this.topicService.collect(collect);
  }
  /** 取消关注某话题 */
  @Post('de_collect')
  @UseGuards(new UserGuard())
  async deCollect(@Body() collect: CollectDto) {
    return await this.topicService.deCollect(collect);
  }
}
