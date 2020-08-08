import { Controller, Get, Query, Render } from '@nestjs/common';
import { HomeDto } from './app-home.dto';
import { AppService } from './app.service';
import { ViewsPath } from './core';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render(ViewsPath.Home)
  async getHome(@Query() query: HomeDto) {
    // return await this.appService.getHome(query);
    return {};
  }
}
