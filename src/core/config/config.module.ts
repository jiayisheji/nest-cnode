import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigService } from './config.service';
import { EnvValidator, ConfigOptions } from './config.interface';

@Global()
@Module({})
export class ConfigModule {
    static resolveRootPath(path: string): typeof ConfigModule {
        ConfigService.resolveRootPath(path);
        return this;
    }
    static resolveEnvValidator(validator: EnvValidator): typeof ConfigModule {
        ConfigService.resolveEnvValidator(validator);
        return this;
    }
    static forRoot(glob: string, options: ConfigOptions): DynamicModule {
        return {
            module: ConfigModule,
            providers: [
                {
                    provide: ConfigService,
                    useFactory: async (): Promise<ConfigService> => ConfigService.load(glob, options),
                },
            ],
            exports: [
                ConfigService,
            ],
        };
    }
}
