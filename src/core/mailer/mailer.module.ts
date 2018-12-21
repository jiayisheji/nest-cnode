import { DynamicModule, Module, Provider, Global } from '@nestjs/common';
import { MailerModuleAsyncOptions, MailerOptionsFactory } from './mailer-options.interface';
import { MailerService } from './mailer.service';
import { MAILER_MODULE_OPTIONS } from './mailer.constants';
import { createMailerClient } from './mailer.provider';

@Global()
@Module({})
export class MailerModule {
    /**
     * 同步引导邮箱模块
     * @param options 邮箱模块的选项
     */
    static forRoot<T>(options: T): DynamicModule {
        return {
            module: MailerModule,
            providers: [
                { provide: MAILER_MODULE_OPTIONS, useValue: options },
                createMailerClient<T>(),
                MailerService,
            ],
            exports: [MailerService],
        };
    }

    /**
     * 异步引导邮箱模块
     * @param options 邮箱模块的选项
     */
    static forRootAsync<T>(options: MailerModuleAsyncOptions<T>): DynamicModule {
        return {
            module: MailerModule,
            imports: options.imports || [],
            providers: [
                ...this.createAsyncProviders(options),
                createMailerClient<T>(),
                MailerService,
            ],
            exports: [MailerService],
        };
    }

    /**
     * 根据给定的模块选项返回异步提供程序
     * @param options 邮箱模块的选项
     */
    private static createAsyncProviders<T>(
        options: MailerModuleAsyncOptions<T>,
    ): Provider[] {
        if (options.useFactory) {
            return [this.createAsyncOptionsProvider<T>(options)];
        }
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: options.useClass,
                useClass: options.useClass,
            },
        ];
    }

    /**
     * 根据给定的模块选项返回异步邮箱选项提供程序
     * @param options 邮箱模块的选项
     */
    private static createAsyncOptionsProvider<T>(
        options: MailerModuleAsyncOptions<T>,
    ): Provider {
        if (options.useFactory) {
            return {
                provide: MAILER_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        return {
            provide: MAILER_MODULE_OPTIONS,
            useFactory: async (optionsFactory: MailerOptionsFactory<T>) => await optionsFactory.createMailerOptions(),
            inject: [options.useClass],
        };
    }
}