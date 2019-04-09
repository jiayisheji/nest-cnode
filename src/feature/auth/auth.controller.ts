import { Controller, Get, Render, Post, Body, Query } from '@nestjs/common';
import { RegisterDto, AccountDto } from './dto';
import { AuthService } from './auth.service';
import { ViewsPath } from 'core';

@Controller()
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}
    /** 注册模板 */
    @Get('/register')
    @Render(ViewsPath.Register)
    async registerView() {
        return { pageTitle: '注册' };
    }
    /** 注册提交 */
    @Post('/register')
    @Render(ViewsPath.Register)
    async register(@Body() register: RegisterDto) {
        return await this.authService.register(register);
    }
    /** 激活账号 */
    @Get('/active_account')
    @Render(ViewsPath.Notify)
    async activeAccount(@Query() account: AccountDto) {
        return await this.authService.activeAccount(account);
    }
}
