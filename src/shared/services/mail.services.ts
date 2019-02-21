import { Injectable } from '@nestjs/common';
import { MailerService } from 'core/mailer';
import { ConfigService, EnvConfig } from 'config';

@Injectable()
export class MailService {
    private readonly from: string;
    private readonly name: string;
    private readonly host: string;
    constructor(
        private readonly mailer: MailerService,
        private readonly configService: ConfigService<EnvConfig>,
    ) {
        this.name = this.configService.get('name');
        this.host = `${this.configService.get('HOST')}:${this.configService.get('PORT')}`;
        this.from = `${this.name} <${this.configService.get('MAIL_USER')}>`;
    }

    /**
     * 激活邮件
     * @param to 激活人邮箱
     * @param token token
     * @param username 名字
     */
    sendActiveMail(to: string, token: string, username: string){
        const name = this.name;
        const subject = `${name}社区帐号激活`;
        const html = `<p>您好：${username}</p>
            <p>我们收到您在${name}社区的注册信息，请点击下面的链接来激活帐户：</p>
            <a href="${this.host}/active_account?key=${token}&name=${username}">激活链接</a>
            <p>若您没有在${name}社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>
            <p>${name}社区 谨上。</p>`;
        this.mailer.send({
            from: this.from,
            to,
            subject,
            html,
        });
    }

    /**
     * 重置密码邮件
     * @param to 重置人邮箱
     * @param token token
     * @param username 名字
     */
    sendResetPassMail(to: string, token: string, username: string) {
        const name = this.name;
        const subject = `${name}社区密码重置`;
        const html = `<p>您好：${username}</p>
            <p>我们收到您在${name}社区重置密码的请求，请在24小时内单击下面的链接来重置密码：</p>
            <a href="${this.host}/reset_pass?key=${token}&name=${username}">重置密码链接</a>
            <p>若您没有在${name}社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>
            <p>${name}社区 谨上。</p>`;
        this.mailer.send({
            from: this.from,
            to,
            subject,
            html,
        });
        this.mailer.send({
            from: this.from,
            to,
            subject,
            html,
        });
    }
}