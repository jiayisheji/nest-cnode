import { DotenvConfigOptions } from 'dotenv';

export interface EnvConfig {
    [key: string]: any;
}

export interface ConfigOptions extends Partial<DotenvConfigOptions> {
    replaceConfigName?: (name: string) => string;
}

export interface EnvValidator {
    validateInput(envConfig: EnvConfig): EnvConfig;
}