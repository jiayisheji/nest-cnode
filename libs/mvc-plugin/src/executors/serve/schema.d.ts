import { NodeExecutorOptions } from '@nrwl/js/src/executors/node/schema';

export interface ServeExecutorSchema extends NodeExecutorOptions {
  buildTargetViewOptions: WebpackExecutorOptions;
}
