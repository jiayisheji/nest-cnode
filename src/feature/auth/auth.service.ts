import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { hashSync, compareSync } from 'bcryptjs';
import * as utility from 'utility';
import { UserService, User } from 'shared';
import { RegisterDto, AccountDto } from './dto';
import { APP_CONFIG } from '../../core';
import { ConfigService } from 'config';
import { MailService } from 'shared/services/mail.services';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name, true);
    constructor(
        private readonly userService: UserService,
        private readonly config: ConfigService,
        private readonly mailService: MailService,
    ) { }

    /** 注册 */
    async register(register: RegisterDto) {
        const { loginname, email } = register;
        // 检查用户是否存在，查询登录名和邮箱
        const exist = await this.userService.count({
            $or: [
                { loginname },
                { email },
            ],
        });
        // 返回1存在，0不存在
        if (exist) {
            return {
                error: '用户名或邮箱已被使用。',
                loginname,
                email,
            };
        }
        // hash加密密码，不能明文存储到数据库
        const passhash = hashSync(register.pass, 10);
        // 保存用户到数据库
        try {
            await this.userService.create({ loginname, email, pass: passhash });

            const token = utility.md5(email + passhash + this.config.get('SESSION_SECRET'));
            this.mailService.sendActiveMail(email, token, loginname);

            return {
                success: `欢迎加入 ${APP_CONFIG.name}！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。`,
            };
        } catch (error) {
           throw new InternalServerErrorException(error);
        }
    }

    /** 激活账户 */
    async activeAccount({ name, key }: AccountDto) {
        const user = await this.userService.findOne({
            loginname: name,
        });
        // 检查用户是否存在
        if (!user) {
            return { error: '用户不存在' };
        }
        // 对比key是否正确
        if (!user || utility.md5(user.email + user.pass + this.config.get('SESSION_SECRET')) !== key) {
            return { error: '信息有误，帐号无法被激活。' };
        }
        // 检查用户是否激活过
        if (user.active) {
            return { error: '帐号已经是激活状态。', referer: '/login' };
        }

        // 如果没有激活，就激活操作
        user.active = true;
        await user.save();
        return { success: '帐号已被激活，请登录', referer: '/login' };
    }

}
