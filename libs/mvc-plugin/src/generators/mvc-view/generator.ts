import { formatFiles, generateFiles, getProjects, getWorkspaceLayout, names, offsetFromRoot, Tree } from '@nrwl/devkit';
import * as path from 'path';
import { MvcPluginGeneratorSchema } from './schema';

interface NormalizedSchema extends MvcPluginGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
}

function normalizeOptions(tree: Tree, options: MvcPluginGeneratorSchema): NormalizedSchema {
  const projectName = options.project;
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${options.project}`;
  const name = options.flat ? '' : `/${names(options.name.replace(new RegExp('/', 'g'), '-').toLowerCase()).fileName}`;
  const directory = options.directory ? `/${names(options.directory).fileName}` : '';
  const views = options.viewsDirectory ? `/${options.viewsDirectory}` : '';
  const projectDirectory = `${projectRoot}${views}${directory}${name}`;

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const name = names(options.name);

  const templateOptions = {
    ...options,
    ...name,
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };

  /**
   * if flat true
   * exist apps/client/src/views/index/index.main.js
   * add apps/client/src/views/index/home.main.js
   * else
   * exist apps/client/src/views/index/index.main.js
   * add apps/client/src/views/index/home/home.main.js
   */
  if (tree.exists(options.projectDirectory) && !options.flat) {
    throw new Error(`Path "${options.projectDirectory}" already exist.`);
  }

  generateFiles(tree, path.join(__dirname, 'files'), options.projectDirectory, templateOptions);

  const partials = `${options.projectDirectory}/partials`;
  if (options.partials && !tree.exists(partials)) {
    tree.write(`${partials}/.gitkeep`, '');
  }
}

export default async function (tree: Tree, options: MvcPluginGeneratorSchema) {
  const project = getProjects(tree).get(options.project);

  if (!project) {
    throw new Error(`Project "${options.project}" does not exist.`);
  }

  const normalizedOptions = normalizeOptions(tree, options);
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}
