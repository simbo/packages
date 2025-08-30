import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockOptions } from '../../tests/mocks.js';

import { createClirkContext } from './create-clirk-context.js';

vi.mock('node:console', () => ({
  log: vi.fn(),
}));

vi.mock('node:path', async () => {
  const actual = await vi.importActual<typeof import('node:path')>('node:path');
  return {
    basename: vi.fn().mockImplementation((path: string) => actual.basename(path)),
  };
});

vi.mock('node:process', () => ({
  argv: ['node', './path/to/test-command', '--option', 'value', 'foo'],
}));

vi.mock('@simbo/graceful-exit', () => ({
  gracefulExit: vi.fn(),
}));

vi.mock('@simbo/find-up-package', () => ({
  findUpPackage: vi.fn().mockResolvedValue({
    packageJson: {
      name: '@scope/test-cli',
      version: '0.1.0',
    },
    path: '/test/path/to/pkg',
  }),
}));

vi.mock('@simbo/cli-output', () => ({
  terminated: vi.fn().mockImplementation((msg: string) => `[terminated] ${msg}`),
}));

vi.mock('minimist', () => ({
  default: vi.fn().mockImplementation(() => ({ _: ['foo'], option: 'value' })),
}));

const { gracefulExit } = vi.mocked(await import('@simbo/graceful-exit'));
const { findUpPackage } = vi.mocked(await import('@simbo/find-up-package'));
const { terminated } = vi.mocked(await import('@simbo/cli-output'));
const { default: minimist } = vi.mocked(await import('minimist'));

describe('createClirkContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('walks the happy path', async () => {
    const ctx = await createClirkContext(mockOptions());

    expect(ctx).toBeDefined();
    expect(findUpPackage).toHaveBeenCalledTimes(1);
    expect(findUpPackage).toHaveBeenCalledWith({
      workingDir: '/test/path/to/pkg/src',
      normalize: true,
    });
    expect(minimist).toHaveBeenCalledTimes(1);
    expect(minimist).toHaveBeenCalledWith(['--option', 'value', 'foo'], {
      alias: {},
      boolean: [],
      default: {},
      string: [],
    });
    expect(terminated).not.toHaveBeenCalled();
    expect(gracefulExit).not.toHaveBeenCalled();
  });

  it('throws if findUpPackage returns undefined', async () => {
    findUpPackage.mockResolvedValueOnce(undefined);
    await expect(createClirkContext(mockOptions())).rejects.toThrowError(
      /^Could not find package for path: \/test\/path\/to\/pkg\/src$/,
    );
  });

  it('takes the description from package.json if none is provided', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: {
        name: '@scope/test-cli',
        version: '0.1.0',
        description: 'Package description',
      },
      path: '/test/path/to/pkg',
    });
    const options = mockOptions();
    expect(options.description).toEqual([]);
    const ctx = await createClirkContext(options);
    expect(ctx.description).toEqual(['Package description']);
  });

  it('takes the command name from process.argv', async () => {
    const options = mockOptions();
    const ctx = await createClirkContext(options);
    expect(ctx.commandName).toEqual('test-command');
  });

  it('maps parameters correctly', async () => {
    const options = mockOptions({ parameters: { FILE: ['File description'] } });
    const ctx = await createClirkContext(options);
    expect(ctx.parameters.get('FILE')).toEqual({ description: ['File description'] });
  });

  it('maps options correctly', async () => {
    const options = mockOptions({
      argsOptions: { boolean: ['force'], string: ['config'], alias: { force: ['f'], config: ['c'] }, default: {} },
      options: { force: ['Force apply'], config: ['Config file'] },
    });
    const ctx = await createClirkContext(options);
    const forceOption = ctx.options.get('force');
    expect(forceOption).toBeDefined();
    expect(forceOption?.description).toEqual(['Force apply']);
    expect(forceOption?.aliases).toEqual(new Set(['f']));
    expect(forceOption?.type).toEqual('boolean');
    const configOption = ctx.options.get('config');
    expect(configOption).toBeDefined();
    expect(configOption?.description).toEqual(['Config file']);
    expect(configOption?.aliases).toEqual(new Set(['c']));
    expect(configOption?.type).toEqual('string');
  });

  it('throws if a documented option is not configured', async () => {
    const options = mockOptions({
      options: { force: ['Force apply'] },
    });
    await expect(createClirkContext(options)).rejects.toThrowError(/^Option not configured: "force"$/);
  });

  it('takes name from package.json bin', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: {
        name: '@scope/test-cli',
        version: '1.0.0',
        bin: {
          'name-from-pkg': './bin/index.js',
        },
      },
      path: '/test/path/to/pkg',
    });
    const ctx = await createClirkContext(mockOptions());
    expect(ctx.name).toBe('name-from-pkg');
  });

  it('takes name from command name if package.json#bin is not set', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: {
        name: '@scope/test-cli',
        version: '1.0.0',
      },
      path: '/test/path/to/pkg',
    });
    const ctx = await createClirkContext(mockOptions());
    expect(ctx.name).toBe('test-command');
  });

  it('sets a default example if none is provided', async () => {
    const ctx = await createClirkContext(mockOptions());
    expect(ctx.examples[0]).toBe('test-command [OPTIONS]');
  });

  it('sets a default example with parameters if parameters are defined', async () => {
    const ctx = await createClirkContext(
      mockOptions({
        parameters: {
          FILE: ['File description'],
          KEY: ['Key description'],
        },
      }),
    );
    expect(ctx.examples[0]).toBe('test-command [OPTIONS] <FILE> <KEY>');
  });

  it('takes args output from minimist', async () => {
    const ctx = await createClirkContext(mockOptions());
    expect(ctx.args).toEqual({
      _: ['foo'],
      option: 'value',
    });
  });
});
