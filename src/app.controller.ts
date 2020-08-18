import { Controller, Get, Query, Redirect, Render, Res } from '@nestjs/common';
import { Response } from 'express';
import { HomeDto } from './app-home.dto';
import { AppService } from './app.service';
import { ViewsPath } from './core';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render(ViewsPath.Home)
  async getHome(@Query() query: HomeDto) {
    return await this.appService.getHome(query);
  }

  @Get('/about')
  @Render('static/about')
  async about() {
    return { pageTitle: '关于我们' };
  }

  @Get('/getstart')
  @Render('static/getstart')
  async getstart() {
    return { pageTitle: 'Node.js 新手入门' };
  }

  @Get('/faq')
  @Render('static/faq')
  async faq() {
    return { pageTitle: 'FAQ' };
  }

  @Get('/api')
  @Render('static/api')
  async api() {
    return { pageTitle: 'API' };
  }

  @Get('/robots.txt')
  async robots(@Res() res: Response) {
    return res.type('text').send(this.appService.robots());
  }

  @Get('/rss')
  async rss(@Res() res: Response) {
    const body = await this.appService.rss();
    return res.type('xml').send(body);
  }

  @Get('/sitemap.xml')
  async sitemap(@Res() res: Response) {
    const body = await this.appService.sitemap();
    return res.type('xml').send(body);
  }

  @Get('/download')
  @Redirect(
    'https://github.com/soliury/noder-react-native/blob/master/README.md',
  )
  async download() {
    return {};
  }
}
