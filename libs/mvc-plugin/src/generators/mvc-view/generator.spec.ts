import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { applicationGenerator } from '@nrwl/nest';

import generator from './generator';
import { MvcPluginGeneratorSchema } from './schema';

describe('mvc-plugin generator', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    const options: MvcPluginGeneratorSchema = { name: 'test', project: 'test' };
    await applicationGenerator(appTree, { name: 'test' });
    await generator(appTree, options);
    expect(appTree.exists('apps/test/test/test.template.hbs')).toBeTruthy();
    expect(appTree.exists('apps/test/test/test.main.js')).toBeTruthy();
    expect(appTree.exists('apps/test/test/test.module.scss')).toBeTruthy();
    expect(appTree.read('apps/test/test/test.main.js', 'utf-8')).toMatch(`import './test.module.scss';`);
  });

  it('should project "beta" does not exist.', async () => {
    const options: MvcPluginGeneratorSchema = { name: 'test', project: 'beta' };
    await applicationGenerator(appTree, { name: 'test' });
    try {
      await generator(appTree, options);
    } catch (error) {
      expect(error.message).toBe(`Project "${options.project}" does not exist.`);
    }
  });

  describe('should Path "apps/test/src/views/user" already exist', () => {
    const options: MvcPluginGeneratorSchema = { name: 'user', project: 'test', viewsDirectory: 'src/views' };
    beforeEach(async () => {
      await applicationGenerator(appTree, { name: 'test' });
      await generator(appTree, options);
    });

    it('duplication of name', async () => {
      try {
        await generator(appTree, options);
        expect(true).toBeTruthy();
      } catch (error) {
        expect(error.message).toBe(`Path "apps/test/src/views/user" already exist.`);
      }
    });

    it('use directory a user', async () => {
      try {
        await generator(appTree, {
          ...options,
          ...{
            name: 'home',
            directory: 'user',
          },
        });
        expect(true).toBeTruthy();
      } catch (error) {
        expect(error.message).toBe(`Path "apps/test/src/views/user" already exist.`);
      }
    });

    it('use directory a user and has flat', async () => {
      try {
        await generator(appTree, {
          ...options,
          ...{
            name: 'home',
            directory: 'user',
          },
        });
        expect(true).toBeTruthy();
      } catch (error) {
        expect(error.message).toBe(`Path "apps/test/src/views/user" already exist.`);
      }
    });

    it('use directory a user and not has flat', async () => {
      try {
        await generator(appTree, {
          ...options,
          ...{
            name: 'home',
            directory: 'user',
          },
        });
        expect(true).toBeTruthy();
      } catch (error) {
        expect(error.message).toBe(`Path "apps/test/src/views/user" already exist.`);
      }
    });
  });
});
