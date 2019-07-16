import { Controller, Get, Render, Post, Body, Query, UseGuards, Logger, Req, Res, All } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ViewsPath } from '../../core';
import { TRequest, TResponse, User } from '../../shared';
import { RegisterDto, AccountDto } from './dto';
import { AuthService } from './auth.service';
import { ConfigService } from 'core/config';

@Controller()
export class AuthController {
    private readonly logger = new Logger(AuthController.name, true);
    private readonly cookie = this.config.get('express.cookie') as string;
    constructor(
        private readonly authService: AuthService,
        private readonly config: ConfigService,
    ) { }
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
    /** 登录模板 */
    @Get('/login')
    @Render(ViewsPath.Login)
    async loginView(@Req() req: TRequest) {
        const error: string = req.flash('loginError')[0];
        return { pageTitle: '登录', error };
    }
    /** 本地登录提交 */
    @Post('/login')
    @UseGuards(AuthGuard('local'))
    async passportLocal(@Req() req: TRequest, @Res() res: TResponse) {
        this.logger.log(JSON.stringify(req.user));
        this.verifyLogin(req, res, req.user);
    }
    /** github登录提交 */
    @Get('/github')
    @UseGuards(AuthGuard('github'))
    async github() {
        return null;
    }

    @Get('/github/callback')
    async githubCallback(@Req() req: TRequest, @Res() res: TResponse) {
        this.logger.log(JSON.stringify(req.user));
        const existUser = await this.authService.github(req.user);
        this.verifyLogin(req, res, existUser);
    }

    /** 登出 */
    @All('/logout')
    async logout(@Req() req: TRequest, @Res() res: TResponse) {
        // 销毁 session
        req.session.destroy();
        // 清除 cookie
        res.clearCookie(this.cookie, { path: '/' });
        // 调用 passport 的 logout方法
        req.logout();
        // 重定向到首页
        res.redirect('/');
    }

    /** 验证登录 */
    private verifyLogin(@Req() req: TRequest, @Res() res: TResponse, user: User) {
        // id 存入 Cookie, 用于验证过期.
        const auth_token = user._id + '$$$$'; // 以后可能会存储更多信息，用 $$$$ 来分隔
        // 配置 Cookie
        const opts = {
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 30,
            signed: true,
            httpOnly: true,
        };
        res.cookie(this.cookie, auth_token, opts); // cookie 有效期30天
        // 调用 passport 的 login方法 传递 user信息
        req.login(user, () => {
            // 重定向首页
            res.redirect('/');
        });
    }
}
