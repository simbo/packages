import type { PackageNormalized } from '@simbo/find-up-package';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ClirkOptions } from '../clirk.types.js';

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
  findUpPackage: vi.fn(),
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

const getOptions = (overrides: Partial<ClirkOptions> = {}): ClirkOptions => ({
  importMeta: { dirname: '/test' } as ImportMeta,
  title: 'Test CLI',
  name: 'test-cli',
  ...overrides,
});

describe('createClirkContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws if importMeta is missing', async () => {
    await expect(
      // @ts-expect-error intentional test for missing field
      async () => createClirkContext({ title: 'My CLI', description: '', examples: [] }),
    ).rejects.toThrow('The importMeta option is required.');
  });

  it('handles minimal valid input', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: {
        name: '@scope/test-cli',
        version: '0.1.0',
        description: 'Single line description',
      },
    } as PackageNormalized);
    const ctx = await createClirkContext(getOptions());

    expect(ctx.title).toBe('Test CLI');
    expect(ctx.description).toEqual(['Single line description']);
    expect(ctx.package.packageJson.name).toBe('@scope/test-cli');
    expect(ctx.examples).toEqual(['test-cli']);
    expect(ctx.sigintHandler).toBeDefined();
    expect(ctx.sigintMessage).toMatch(/^\[terminated] Received SIGINT$/);
  });

  it('handles non-array alias values', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: {
        name: 'alias-test',
        version: '1.0.0',
        description: '',
      },
    } as PackageNormalized);
    const ctx = await createClirkContext(
      getOptions({
        options: {
          force: 'Force apply',
        },
        argsOptions: {
          alias: { force: 'f' },
          boolean: ['force'],
        },
      }),
    );

    const opt = ctx.options.get('force');
    expect(opt).toBeDefined();
    expect([...(opt?.aliases ?? [])]).toEqual(['f']);
  });

  it('handles missing description and homepage', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: {
        name: 'no-desc-pkg',
        version: '0.0.0',
      },
    } as PackageNormalized);
    const ctx = await createClirkContext(getOptions());

    expect(ctx.description).toEqual([]);
    expect(ctx.package.packageJson.name).toBe('no-desc-pkg');
  });

  it('parses multi-line parameters and options', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: {
        name: 'multi-line',
        version: '1.2.3',
        description: '',
      },
    } as PackageNormalized);
    const ctx = await createClirkContext(
      getOptions({
        parameters: {
          FILE: ['First line', 'Second line'],
        },
        options: {
          deep: ['Deep mode', 'Recursively scan'],
        },
        argsOptions: {
          alias: { deep: ['d'] },
          boolean: ['deep'],
        },
      }),
    );

    const param = ctx.parameters.get('FILE');
    expect(param?.description).toEqual(['First line', 'Second line']);
    const opt = ctx.options.get('deep');
    expect(opt?.description).toEqual(['Deep mode', 'Recursively scan']);
  });

  it('handles empty and non-string parameter values safely', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: {
        name: 'bad-input',
        version: '1.0.0',
        description: '',
      },
    } as PackageNormalized);
    const ctx = await createClirkContext(
      getOptions({
        parameters: {
          BROKEN: [undefined as unknown as string, 'should ignore null'],
          EMPTY: [],
        },
        options: {
          skip: 123 as unknown as string, // Intentionally invalid type
        },
        argsOptions: {
          alias: { skip: 's' },
        },
      }),
    );

    const broken = ctx.parameters.get('BROKEN');
    expect(broken?.description).toEqual(['should ignore null']);
    const empty = ctx.parameters.get('EMPTY');
    expect(empty?.description).toEqual([]);
    const opt = ctx.options.get('skip');
    expect(opt?.description).toEqual([]);
  });

  it('handles alias defined as a single string', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'alias-str', version: '0.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(
      getOptions({
        options: {
          file: 'File path',
        },
        argsOptions: {
          alias: { file: 'f' },
        },
      }),
    );

    const opt = ctx.options.get('file');
    expect(opt?.aliases).toEqual(new Set(['f']));
  });

  it('handles alias defined as an array', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'alias-arr', version: '0.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(
      getOptions({
        options: {
          file: 'File path',
        },
        argsOptions: {
          alias: { file: ['f', 'F'] },
        },
      }),
    );

    const opt = ctx.options.get('file');
    expect(opt?.aliases).toEqual(new Set(['f', 'F']));
  });

  it('handles missing alias key with empty set fallback', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'alias-missing', version: '0.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(
      getOptions({
        options: {
          file: 'File path',
        },
        argsOptions: {
          alias: {}, // no entry for 'file'
        },
      }),
    );

    const opt = ctx.options.get('file');
    expect(opt?.aliases.size).toBe(0);
  });

  it('detects boolean flag via `argsOptions.boolean === true` (edge case)', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'bool-true', version: '0.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(
      getOptions({
        options: {
          foo: 'Enable foo',
        },
        argsOptions: {
          boolean: true, // unusual but allowed
        },
      }),
    );

    const opt = ctx.options.get('foo');
    expect(opt?.isBoolean).toBe(true);
  });

  it('handles missing argsOptions.string (undefined)', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'no-string', version: '0.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(
      getOptions({
        options: {
          bar: 'Some option',
        },
      }),
    );

    const opt = ctx.options.get('bar');
    expect(opt?.isString).toBe(false);
  });

  it('handles invalid argsOptions.string (not array)', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'bad-string', version: '0.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(
      getOptions({
        options: {
          bar: 'Some option',
        },
        argsOptions: {
          string: 'bar' as unknown as string[], // invalid on purpose
        },
      }),
    );

    const opt = ctx.options.get('bar');
    expect(opt?.isString).toBe(false);
  });

  it('sets isString to true if key is in argsOptions.string', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'string-ok', version: '0.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(
      getOptions({
        options: {
          bar: 'Some option',
        },
        argsOptions: {
          string: ['bar'],
        },
      }),
    );

    const opt = ctx.options.get('bar');
    expect(opt?.isString).toBe(true);
  });

  it('handles undefined parameters and options', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'no-params-or-options', version: '0.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(getOptions());

    expect(ctx.parameters.size).toBe(0);
    expect(ctx.options.size).toBe(0);
  });

  it('uses the specified examples', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'fallback-example', version: '0.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(getOptions({ examples: ['foo'] }));

    expect(ctx.examples).toEqual(['foo']);
  });

  it('adds fallback example using name if examples is empty string', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'fallback-example', version: '0.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(getOptions());

    expect(ctx.examples).toEqual(['test-cli']);
  });

  it('filters out non-strings in description array', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'desc-mixed', version: '0.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(
      getOptions({
        description: ['valid', null, undefined, 42] as unknown as string[],
      }),
    );

    expect(ctx.description).toEqual(['valid']);
  });

  it('handles options when argsOptions is not provided', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'no-args-options', version: '0.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(
      getOptions({
        options: {
          mode: 'Set mode',
        },
      }),
    );

    const opt = ctx.options.get('mode');
    expect(opt?.aliases.size).toBe(0);
    expect(opt?.isBoolean).toBe(false);
    expect(opt?.isString).toBe(false);
  });

  it('filters non-string values in alias arrays safely', async () => {
    findUpPackage.mockResolvedValue({
      packageJson: { name: 'bad-aliases', version: '0.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(
      getOptions({
        options: {
          depth: 'Set depth level',
        },
        argsOptions: {
          alias: {
            depth: ['d', 42, null] as unknown as string[],
          },
        },
      }),
    );

    expect([...(ctx.options.get('depth')?.aliases ?? [])]).toContain('d');
  });

  it('uses default sigintHandler and default message if not set', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'sigint-default', version: '1.0.0' },
    } as PackageNormalized);

    const ctx = await createClirkContext(getOptions());

    expect(ctx.sigintHandler).toBeInstanceOf(Function);
    expect(ctx.sigintMessage).toMatch(/^\[terminated] Received SIGINT$/);
  });

  it('uses default sigintHandler with custom message if provided', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'sigint-msg', version: '1.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(
      getOptions({
        sigintMessage: 'Shutting down gracefully...',
      }),
    );

    expect(ctx.sigintHandler).toBeInstanceOf(Function);
    expect(ctx.sigintMessage).toBe('Shutting down gracefully...');
  });

  it('uses custom sigintHandler if provided', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'sigint-custom', version: '1.0.0' },
    } as PackageNormalized);
    const handler = vi.fn();
    const ctx = await createClirkContext(
      getOptions({
        sigintHandler: handler,
        sigintMessage: 'This should be ignored by handler',
      }),
    );

    expect(ctx.sigintHandler).toBe(handler);
    expect(ctx.sigintMessage).toBe('This should be ignored by handler');
  });

  it('disables sigintHandler when explicitly set to false', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'sigint-off', version: '1.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(
      getOptions({
        sigintHandler: false,
      }),
    );

    expect(ctx.sigintHandler).toBeUndefined();
  });

  it('default sigintHandler calls gracefulExit with 1', async () => {
    findUpPackage.mockResolvedValueOnce({
      packageJson: { name: 'sigint-run', version: '1.0.0' },
    } as PackageNormalized);
    const ctx = await createClirkContext(getOptions());

    ctx.sigintHandler?.();
    expect(terminated).toHaveBeenCalledWith('Received SIGINT');
    expect(gracefulExit).toHaveBeenCalledWith(undefined, 1);
  });

  it('throws when the CLI package could not be found', async () => {
    findUpPackage.mockResolvedValueOnce(undefined);
    await expect(createClirkContext(getOptions())).rejects.toThrow(/^Could not find package for path: \/test$/);
  });
});
