import { WebpackExecutorOptions } from '@nrwl/webpack';

export interface BuildExecutorSchema extends WebpackExecutorOptions {
  browserOptions: WebpackExecutorOptions;
}
