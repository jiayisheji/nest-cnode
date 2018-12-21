import { Module } from '@nestjs/common';
import { ConfigModule, EnvConfig, ConfigService } from '../config';
import { ConfigValidate } from './config.validate';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule, SMTPTransportOptions } from './mailer';

@Module({
    imports: [
        ConfigModule.forRoot<EnvConfig>(null, ConfigValidate.validateInput),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get('MONGODB_URI'),
                useNewUrlParser: true,
            }),
            inject: [ConfigService],
        }),
    ],
})
export class CoreModule {
}