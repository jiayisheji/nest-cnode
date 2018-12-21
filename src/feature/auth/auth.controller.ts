import { Controller, Get, Render, Post, Body } from '@nestjs/common';
import { RegisterDto } from './dto';
import { AuthService } from './auth.service';
import { ViewsPath } from 'core';

@Controller()
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Get('/register')
    @Render(ViewsPath.Register)
    async registerView() {
        return { pageTitle: '注册' };
    }

    @Post('/register')
    @Render(ViewsPath.Register)
    async register(@Body() register: RegisterDto) {
        return await this.authService.register(register);
    }

}
