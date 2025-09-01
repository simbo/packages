import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { createConfigLoader } from './config-loader.js';

vi.mock('node:console', () => ({
  log: vi.fn(),
}));

vi.mock('cosmiconfig', () => ({
  cosmiconfig: vi.fn(),
}));

vi.mock('cosmiconfig-typescript-loader', () => ({
  TypeScriptLoader: vi.fn().mockReturnValue('loader'),
}));

vi.mock('yoctocolors', () => ({
  dim: vi.fn().mockImplementation((str: string) => `[d]${str}[/d]`),
}));

vi.mock('./config-schema.js', () => ({
  validateConfig: vi.fn().mockImplementation((config: Record<string, unknown> | undefined) => ({
    ...config,
    validated: true,
  })),
}));

const { cosmiconfig } = vi.mocked(await import('cosmiconfig'));
const { validateConfig } = vi.mocked(await import('./config-schema.js'));
const { log } = vi.mocked(await import('node:console'));
const search = vi.fn();
const load = vi.fn();

describe('loadConfig', () => {
  let configObj: Record<string, unknown> | undefined;

  beforeEach(() => {
    vi.clearAllMocks();

    (cosmiconfig as Mock).mockImplementation(
      (
        _name: never,
        {
          transform,
        }: { transform: (input: { config: unknown; filepath: string }) => { config: unknown; filepath: string } },
      ) => {
        search.mockImplementation((basePath: string) => transform({ filepath: `${basePath}/file`, config: configObj }));
        load.mockImplementation((filePath: string) => transform({ filepath: filePath, config: configObj }));
        return { search, load };
      },
    );
  });

  it('loads and validates the default config file using cosmiconfig', async () => {
    const loadConfig = createConfigLoader('/monorepo');
    configObj = { someConfig: true };
    const config = await loadConfig();

    expect(cosmiconfig).toHaveBeenCalledWith('monorepo-packages-list', expect.any(Object));
    expect(search).toHaveBeenCalledWith('/monorepo');
    expect(load).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('[d]Using configuration from ./file[/d]');
    expect(config).toEqual({ someConfig: true, validated: true });
  });

  it('loads and validates a custom config file using cosmiconfig', async () => {
    const loadConfig = createConfigLoader('/monorepo');
    configObj = { someConfig: true };
    const config = await loadConfig('path/to/custom');

    expect(cosmiconfig).toHaveBeenCalledWith('monorepo-packages-list', expect.any(Object));
    expect(search).not.toHaveBeenCalled();
    expect(load).toHaveBeenCalledWith('/monorepo/path/to/custom');
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('[d]Using configuration from ./path/to/custom[/d]');
    expect(config).toEqual({ someConfig: true, validated: true });
  });

  it('falls back to the default config if no file was found', async () => {
    const loadConfig = createConfigLoader('/monorepo');
    configObj = undefined;
    const config = await loadConfig();

    expect(cosmiconfig).toHaveBeenCalledWith('monorepo-packages-list', expect.any(Object));
    expect(search).toHaveBeenCalledWith('/monorepo');
    expect(load).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('[d]No configuration file found, using default configuration.[/d]');
    expect(config).toEqual({ validated: true });
  });

  it('throws if validateConfig fails', async () => {
    validateConfig.mockImplementationOnce(() => {
      throw new Error('Validation error');
    });
    const loadConfig = createConfigLoader('/monorepo');
    configObj = { someConfig: false };

    await expect(loadConfig()).rejects.toThrowError(`Failed to parse the config file: ./file (Validation error)`);
  });
});
