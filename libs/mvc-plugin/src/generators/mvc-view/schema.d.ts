export interface MvcPluginGeneratorSchema {
  name: string;
  project: string;
  viewsDirectory?: string;
  directory?: string;
  partials?: boolean;
  flat?: boolean;
}
