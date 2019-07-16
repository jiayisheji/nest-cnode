import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from './config';
import { ConfigValidate } from './config.validate';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule, SMTPTransportOptions } from './mailer';
import { PassportModule } from '@nestjs/passport';
import { resolve } from 'path';
import { MailConfig } from 'config/mail';
@Module({
    imports: [
        PassportModule.register({
            session: false,
        }),
        ConfigModule
            .resolveRootPath(resolve(__dirname, '../..'))
            .resolveEnvValidator(new ConfigValidate())
            .forRoot(
                resolve(__dirname, '..', 'config', '**', '!(*.d).{ts,js}'),
                {
                    path: `${process.env.NODE_ENV || 'development'}.env`,
                }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get('env.MONGODB_URI'),
                useNewUrlParser: true,
            }),
            inject: [ConfigService],
        }),
        MailerModule.forRootAsync<SMTPTransportOptions>({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                return configService.get<MailConfig>('mail');
            },
            inject: [ConfigService],
        }),
    ],
})
export class CoreModule {
}