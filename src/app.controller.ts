import { Controller, Get, Render, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response, NextFunction } from 'express';

import { ViewsPath } from 'src/core/enums';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @Render('index')
  getHello(): {} {
    // console.log(res);
    return {};
  }
}
