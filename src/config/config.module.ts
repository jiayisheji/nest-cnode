import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';

export const Configuration = new ConfigService(`${process.env.NODE_ENV}.env`);

@Module({
    providers: [
        {
            provide: ConfigService,
            useValue: Configuration,
        },
    ],
    exports: [ConfigService],
})
export class ConfigModule { }