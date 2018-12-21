import { Module } from '@nestjs/common';
import { ConfigModule, EnvConfig, ConfigService } from '../config';
import { ConfigValidate } from './config.validate';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule, SMTPTransportOptions } from './mailer';

@Module({
    imports: [
        ConfigModule.forRoot<EnvConfig>(null, ConfigValidate.validateInput),
    ],
})
export class CoreModule {
}