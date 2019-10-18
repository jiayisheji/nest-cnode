import { Controller, Get, Render, Post, Body, Query, UseGuards, Logger, Req, Res, All } from '@nestjs/common';
import { ViewsPath } from '../../core';
import { TRequest, TResponse } from '../../shared';
import { TopicService } from './topic.service';

@Controller('topic')
export class TopicController {
    private readonly logger = new Logger(TopicController.name, true);
    constructor(
        private readonly topicService: TopicService,
    ) { }

    /** 发布话题 */
    @Get('/create')
    @Render(ViewsPath.TopicCreate)
    async createView() {
        return {
            pageTitle: '发布话题',
            tabs: [],
        };
    }

    /** 发布话题 */
    @Post('/create')
    @Render(ViewsPath.TopicCreate)
    async create() {
        return {
            pageTitle: '发布话题',
            tabs: [],
        };
    }

}
