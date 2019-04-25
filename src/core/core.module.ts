import { Module } from '@nestjs/common';
import { ConfigModule, EnvConfig, ConfigService } from '../config';
import { ConfigValidate } from './config.validate';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule, SMTPTransportOptions } from './mailer';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [
        PassportModule.register({
            session: false,
        }),
        ConfigModule.forRoot<EnvConfig>(null, ConfigValidate.validateInput),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get('MONGODB_URI'),
                useNewUrlParser: true,
            }),
            inject: [ConfigService],
        }),
        MailerModule.forRootAsync<SMTPTransportOptions>({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const mailer = configService.getKeys(['MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASS']);
                return {
                    host: mailer.MAIL_HOST,     // 邮箱smtp地址
                    port: mailer.MAIL_PORT * 1, // 端口号
                    secure: true,
                    secureConnection: true,
                    auth: {
                        user: mailer.MAIL_USER,  // 邮箱账号
                        pass: mailer.MAIL_PASS,  // 授权码
                    },
                    ignoreTLS: true,
                };
            },
            inject: [ConfigService],
        }),
    ],
})
export class CoreModule {
}