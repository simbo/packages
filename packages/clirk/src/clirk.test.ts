import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ParsedOptions } from './schemas/options-schema.js';
import type { ClirkOptions } from './types/clirk-options.interface.js';

vi.mock('node:console', () => ({
  log: vi.fn(),
}));

vi.mock('node:process', () => ({
  argv: ['node', './path/to/test-command'],
}));

vi.mock('node:path', async () => {
  const actual = await vi.importActual<typeof import('node:path')>('node:path');
  return {
    basename: vi.fn().mockImplementation((path: string) => actual.basename(path)),
  };
});

vi.mock('@simbo/graceful-exit', () => ({
  gracefulExit: vi.fn(),
  looseGracefulExit: vi.fn(),
}));

vi.mock('@simbo/stringify-error', () => ({
  stringifyError: vi.fn(),
}));

vi.mock('@simbo/find-up-package', () => ({
  findUpPackage: vi.fn().mockResolvedValue({ packageJson: { name: 'test', version: '1.0.0' } }),
}));

vi.mock('@simbo/cli-output', () => ({
  terminated: vi.fn().mockImplementation((msg: string) => `[terminated] ${msg}`),
}));

vi.mock('minimist', () => ({
  default: vi.fn().mockImplementation(() => ({ _: [] })),
}));

vi.mock('./lib/add-flags-to-options.js', async () => {
  const actual = await vi.importActual<typeof import('./lib/add-flags-to-options.js')>('./lib/add-flags-to-options.js');
  return {
    addFlagsToOptions: vi.fn().mockImplementation((options: ParsedOptions, flags: Record<string, boolean>) => {
      actual.addFlagsToOptions(options, flags);
    }),
  };
});

vi.mock('./lib/create-clirk-context.js', async () => {
  const actual = await vi.importActual<typeof import('./lib/create-clirk-context.js')>('./lib/create-clirk-context.js');
  return {
    createClirkContext: vi
      .fn()
      .mockImplementation(async (options: ParsedOptions) => actual.createClirkContext(options)),
  };
});

vi.mock('./lib/apply-sigint-handler.js', async () => ({
  applySigintHandler: vi.fn(),
}));

vi.mock('./lib/generate-help-message.js', () => ({
  generateHelpMessage: vi.fn().mockImplementation(() => '[help message]'),
}));

vi.mock('./lib/generate-version-message.js', () => ({
  generateVersionMessage: vi.fn().mockImplementation(() => '[version message]'),
}));

vi.mock('./schemas/validate-options.js', async () => {
  const actual = await vi.importActual<typeof import('./schemas/validate-options.js')>('./schemas/validate-options.js');
  return {
    validateOptions: vi.fn().mockImplementation((options: ClirkOptions) => actual.validateOptions(options)),
  };
});

const { log } = vi.mocked(await import('node:console'));
const { gracefulExit } = vi.mocked(await import('@simbo/graceful-exit'));
const { generateHelpMessage } = vi.mocked(await import('./lib/generate-help-message.js'));
const { generateVersionMessage } = vi.mocked(await import('./lib/generate-version-message.js'));
const { addFlagsToOptions } = vi.mocked(await import('./lib/add-flags-to-options.js'));
const { createClirkContext } = vi.mocked(await import('./lib/create-clirk-context.js'));
const { validateOptions } = vi.mocked(await import('./schemas/validate-options.js'));
const { applySigintHandler } = vi.mocked(await import('./lib/apply-sigint-handler.js'));
const { default: minimist } = vi.mocked(await import('minimist'));

const { clirk } = await import('./clirk.js');

describe('clirk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('walks the happy path with minimal options', async () => {
    const options = {
      importMetaDirname: '/test',
      title: 'Test CLI',
    };
    const context = await clirk(options);
    expect(context).toEqual(expect.objectContaining({ title: 'Test CLI' }));
    expect(validateOptions).toHaveBeenCalledTimes(1);
    expect(validateOptions).toHaveBeenCalledWith(options);
    expect(addFlagsToOptions).toHaveBeenCalledTimes(1);
    expect(addFlagsToOptions).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test CLI' }), {
      help: true,
      version: true,
    });
    expect(createClirkContext).toHaveBeenCalledTimes(1);
    expect(createClirkContext).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test CLI' }));
    expect(applySigintHandler).toHaveBeenCalledTimes(1);
    expect(applySigintHandler).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test CLI' }));
    expect(generateHelpMessage).not.toHaveBeenCalled();
    expect(generateVersionMessage).not.toHaveBeenCalled();
    expect(gracefulExit).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('displays help message when called with --help flag', async () => {
    minimist.mockReturnValueOnce({ _: [], help: true });
    const options = {
      importMetaDirname: '/test',
      title: 'Test CLI',
    };
    const context = await clirk(options);

    expect(context).toBeUndefined();
    expect(generateHelpMessage).toHaveBeenCalledTimes(1);
    expect(generateHelpMessage).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test CLI' }));
    expect(generateVersionMessage).not.toHaveBeenCalled();
    expect(gracefulExit).toHaveBeenCalledTimes(1);
    expect(gracefulExit).toHaveBeenCalledWith();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('[help message]');
  });

  it('displays version message when called with --version flag', async () => {
    minimist.mockReturnValueOnce({ _: [], version: true });
    const options = {
      importMetaDirname: '/test',
      title: 'Test CLI',
    };
    const context = await clirk(options);

    expect(context).toBeUndefined();
    expect(generateHelpMessage).not.toHaveBeenCalled();
    expect(generateVersionMessage).toHaveBeenCalledTimes(1);
    expect(generateVersionMessage).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test CLI' }));
    expect(gracefulExit).toHaveBeenCalledTimes(1);
    expect(gracefulExit).toHaveBeenCalledWith();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('[version message]');
  });

  it('skips handling --help if flag is defined by user', async () => {
    minimist.mockReturnValueOnce({ _: [], help: true });
    const options = {
      importMetaDirname: '/test',
      title: 'Test CLI',
      argsOptions: { boolean: ['help'] },
    };
    const context = await clirk(options);

    expect(context).toEqual(expect.objectContaining({ title: 'Test CLI' }));
    expect(addFlagsToOptions).toHaveBeenCalledTimes(1);
    expect(addFlagsToOptions).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test CLI' }), {
      help: false,
      version: true,
    });
    expect(generateHelpMessage).not.toHaveBeenCalled();
    expect(gracefulExit).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('skips handling --version if flag is defined by user', async () => {
    minimist.mockReturnValueOnce({ _: [], version: true });
    const options = {
      importMetaDirname: '/test',
      title: 'Test CLI',
      argsOptions: { boolean: ['version'] },
    };
    const context = await clirk(options);

    expect(context).toEqual(expect.objectContaining({ title: 'Test CLI' }));
    expect(addFlagsToOptions).toHaveBeenCalledTimes(1);
    expect(addFlagsToOptions).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test CLI' }), {
      help: true,
      version: false,
    });
    expect(generateVersionMessage).not.toHaveBeenCalled();
    expect(gracefulExit).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('handles missing argsOptions and creates options for help and version', async () => {
    const options = {
      importMetaDirname: '/test',
      title: 'Test CLI',
    };
    const context = await clirk(options);

    expect(context).toEqual(expect.objectContaining({ title: 'Test CLI' }));
    expect(typeof context.getHelpMessage).toBe('function');
    expect(typeof context.getVersionMessage).toBe('function');
    expect(context.getHelpMessage()).toBe('[help message]');
    expect(context.getVersionMessage()).toBe('[version message]');
    expect(addFlagsToOptions).toHaveBeenCalledTimes(1);
    expect(addFlagsToOptions).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test CLI' }), {
      help: true,
      version: true,
    });
    expect(gracefulExit).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('does not call gracefulExit if help/version are not passed', async () => {
    const options = {
      importMetaDirname: '/test',
      title: 'Test CLI',
    };
    const context = await clirk(options);

    expect(context.args).toEqual({ _: [] });
    expect(gracefulExit).not.toHaveBeenCalled();
  });

  it('registers SIGINT handler if provided', async () => {
    const handler = (): void => {};
    const options = {
      importMetaDirname: '/test',
      title: 'Test CLI',
      sigintHandler: handler,
    };
    const context = await clirk(options);

    expect(context.sigintHandler).toBe(handler);
    expect(applySigintHandler).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test CLI', sigintHandler: handler }),
    );
  });

  it('does not register SIGINT handler if sigintHandler is false', async () => {
    const options = {
      importMetaDirname: '/test',
      title: 'Test CLI',
      sigintHandler: false,
    } as ClirkOptions;
    const context = await clirk(options);

    expect(context.sigintHandler).toBe(false);
    expect(applySigintHandler).not.toHaveBeenCalled();
  });
});
