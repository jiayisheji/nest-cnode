import {
  Controller,
  Get,
  Param,
  Post,
  Render,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard, UserGuard } from 'src/core';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  /** 显示积分前一百用户页 */
  @Get('/users/top100')
  @Render('user/top100')
  async top100() {
    const users = await this.userService.top100();
    return {
      users,
      pageTitle: 'top100',
    };
  }

  /** 用户个人主页 */
  @Get('/user/:name')
  @Render('user/index')
  async home(@Param('name') name: string) {
    return await this.userService.home(name);
  }

  /** 用户个人设置页 */
  @Get('/setting')
  @UseGuards(new UserGuard())
  @Render('user/setting')
  async settingView() {
    return await this.userService.settingView();
  }

  /** 提交个人信息设置 */
  @Post('/setting')
  @UseGuards(new UserGuard())
  async setting() {
    return await this.userService.setting();
  }

  /** 显示所有达人列表页 */
  @Get('/stars')
  @Render('user/stars')
  async stars() {
    return await this.userService.stars();
  }

  /** 用户收藏的所有话题页 */
  @Get('/user/:name/collections')
  @Render('user/collect_topics')
  async listCollectedTopics(@Param('name') name: string) {
    return await this.userService.listCollectedTopics(name);
  }

  /** 用户发布的所有话题页 */
  @Get('/user/:name/topics')
  @Render('user/topics')
  async listTopics(@Param('name') name: string) {
    return await this.userService.listTopics(name);
  }

  /** 用户参与的所有回复页 */
  @Get('/user/:name/replies')
  @Render('user/replies')
  async listReplies(@Param('name') name: string) {
    return await this.userService.listReplies(name);
  }

  /** 把某用户设为达人 */
  @Post('/user/set_star')
  @UseGuards(new AdminGuard())
  async setStar() {
    return await this.userService.star();
  }

  /** 取消某用户的达人身份 */
  @Post('/user/cancel_star')
  @UseGuards(new AdminGuard())
  async cancelStar() {
    return await this.userService.star();
  }

  /** 禁言某用户 */
  @Post('/user/:name/block')
  @UseGuards(new AdminGuard())
  async block() {
    return await this.userService.block();
  }

  /** 删除某用户所有发言 */
  @Post('/user/:name/delete_all')
  @UseGuards(new AdminGuard())
  async deleteAll() {
    return await this.userService.deleteAll();
  }
}
