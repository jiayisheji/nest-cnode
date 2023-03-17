import { NodeExecutorOptions } from '@nrwl/js/src/executors/node/schema';
import { WebpackExecutorOptions } from '@nrwl/webpack';

export interface ServeExecutorSchema extends NodeExecutorOptions {
  buildTargetBrowserOptions: WebpackExecutorOptions;
  serverPort: number;
}
