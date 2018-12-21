import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { hashSync, compareSync } from 'bcryptjs';
import * as utility from 'utility';
import { UserService, User } from 'shared';
import { RegisterDto } from './dto';
import { APP_CONFIG } from '../../core';
import { ConfigService } from 'config';
import { MailerService } from 'core/mailer';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name, true);
    constructor(
        private readonly userService: UserService,
        private readonly config: ConfigService,
        private readonly mailerService: MailerService,
    ) { }

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

            const subject = APP_CONFIG.name + '社区帐号激活';
            const host = `${this.config.get('HOST')}:${this.config.get('PORT')}`;
            const from = `${APP_CONFIG.name} <${this.config.get('MAIL_USER')}>`;
            const token = utility.md5(email + passhash + this.config.get('SESSION_SECRET'));
            const html = '<p>您好：' + loginname + '</p>' +
                '<p>我们收到您在' + APP_CONFIG.name + '社区的注册信息，请点击下面的链接来激活帐户：</p>' +
                '<a href="' + host + '/active_account?key=' + token + '&name=' + loginname + '">激活链接</a>' +
                '<p>若您没有在' + APP_CONFIG.name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
                '<p>' + APP_CONFIG.name + '社区 谨上。</p>';

            this.mailerService.send({
                from,
                to: email,
                subject,
                html,
            });

            return {
                success: `欢迎加入 ${APP_CONFIG.name}！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。`,
            };
        } catch (error) {
           throw new InternalServerErrorException(error);
        }
    }
}
