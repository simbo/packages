import type { Opts } from 'minimist';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import type { ClirkOptions } from './clirk.types.js';

vi.mock('node:console', () => ({
  log: vi.fn(),
}));

vi.mock('node:process', () => ({
  default: {
    on: vi.fn(),
    listenerCount: vi.fn(() => 0),
  },
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
    addFlagsToOptions: vi
      .fn()
      .mockImplementation((options: ClirkOptions, flags: Record<string, boolean>) =>
        actual.addFlagsToOptions(options, flags),
      ),
  };
});

vi.mock('./lib/create-clirk-context.js', async () => {
  const actual = await vi.importActual<typeof import('./lib/create-clirk-context.js')>('./lib/create-clirk-context.js');
  return {
    createClirkContext: vi.fn().mockImplementation(async (options: ClirkOptions) => actual.createClirkContext(options)),
  };
});

vi.mock('./lib/is-flag-defined.js', async () => {
  const actual = await vi.importActual<typeof import('./lib/is-flag-defined.js')>('./lib/is-flag-defined.js');
  return {
    isFlagDefined: vi.fn().mockImplementation((opts: Opts, flags: string) => actual.isFlagDefined(opts, flags)),
  };
});

vi.mock('./lib/generate-help-message.js', () => ({
  generateHelpMessage: vi.fn().mockImplementation(() => '[help message]'),
}));

vi.mock('./lib/generate-version-message.js', () => ({
  generateVersionMessage: vi.fn().mockImplementation(() => '[version message]'),
}));

const {
  default: { on, listenerCount },
} = vi.mocked(await import('node:process')) as unknown as { default: { on: Mock; listenerCount: Mock } };

const { log } = vi.mocked(await import('node:console'));
const { gracefulExit } = vi.mocked(await import('@simbo/graceful-exit'));
const { generateHelpMessage } = vi.mocked(await import('./lib/generate-help-message.js'));
const { generateVersionMessage } = vi.mocked(await import('./lib/generate-version-message.js'));
const { default: minimist } = vi.mocked(await import('minimist'));
const { addFlagsToOptions } = vi.mocked(await import('./lib/add-flags-to-options.js'));
const { createClirkContext } = vi.mocked(await import('./lib/create-clirk-context.js'));
const { isFlagDefined } = vi.mocked(await import('./lib/is-flag-defined.js'));

const { clirk } = await import('./clirk.js');

const getOptions = (overrides: Partial<ClirkOptions> = {}): ClirkOptions => ({
  importMeta: { dirname: '/test' } as ImportMeta,
  title: 'Test CLI',
  name: 'test-cli',
  ...overrides,
});

describe('clirk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('walks the happy path with minimal options', async () => {
    const options = getOptions();
    const context = await clirk(options);
    expect(context).toEqual(expect.objectContaining({ name: 'test-cli', title: 'Test CLI' }));
    expect(isFlagDefined).toHaveBeenCalledTimes(2);
    expect(isFlagDefined).toHaveBeenNthCalledWith(1, undefined, 'help');
    expect(isFlagDefined).toHaveBeenNthCalledWith(2, undefined, 'version');
    expect(addFlagsToOptions).toHaveBeenCalledTimes(1);
    expect(addFlagsToOptions).toHaveBeenCalledWith(options, { help: true, version: true });
    expect(createClirkContext).toHaveBeenCalledTimes(1);
    expect(createClirkContext).toHaveBeenCalledWith(expect.objectContaining({ name: 'test-cli', title: 'Test CLI' }));
    expect(listenerCount).toHaveBeenCalledTimes(1);
    expect(listenerCount).toHaveBeenCalledWith('SIGINT');
    expect(on).toHaveBeenCalledTimes(1);
    expect(on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(generateHelpMessage).not.toHaveBeenCalled();
    expect(generateVersionMessage).not.toHaveBeenCalled();
    expect(gracefulExit).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('displays help message when called with --help flag', async () => {
    minimist.mockReturnValueOnce({ _: [], help: true });
    const options = getOptions();
    const context = await clirk(options);

    expect(context).toBeUndefined();
    expect(generateHelpMessage).toHaveBeenCalledTimes(1);
    expect(generateHelpMessage).toHaveBeenCalledWith(expect.objectContaining({ name: 'test-cli', title: 'Test CLI' }));
    expect(generateVersionMessage).not.toHaveBeenCalled();
    expect(gracefulExit).toHaveBeenCalledTimes(1);
    expect(gracefulExit).toHaveBeenCalledWith();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('[help message]');
  });

  it('displays version message when called with --version flag', async () => {
    minimist.mockReturnValueOnce({ _: [], version: true });
    const options = getOptions();
    const context = await clirk(options);

    expect(context).toBeUndefined();
    expect(generateHelpMessage).not.toHaveBeenCalled();
    expect(generateVersionMessage).toHaveBeenCalledTimes(1);
    expect(generateVersionMessage).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'test-cli', title: 'Test CLI' }),
    );
    expect(gracefulExit).toHaveBeenCalledTimes(1);
    expect(gracefulExit).toHaveBeenCalledWith();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('[version message]');
  });

  it('skips handling --help if flag is defined by user', async () => {
    minimist.mockReturnValueOnce({ _: [], help: true });
    const options = getOptions({ argsOptions: { boolean: ['help'] } });
    const context = await clirk(options);

    expect(context).toEqual(expect.objectContaining({ name: 'test-cli', title: 'Test CLI' }));
    expect(isFlagDefined).toHaveBeenCalledTimes(2);
    expect(isFlagDefined).toHaveBeenNthCalledWith(1, { boolean: ['help'] }, 'help');
    expect(isFlagDefined).toHaveBeenNthCalledWith(2, { boolean: ['help'] }, 'version');
    expect(addFlagsToOptions).toHaveBeenCalledTimes(1);
    expect(addFlagsToOptions).toHaveBeenCalledWith(options, { help: false, version: true });
    expect(generateHelpMessage).not.toHaveBeenCalled();
    expect(gracefulExit).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('skips handling --version if flag is defined by user', async () => {
    minimist.mockReturnValueOnce({ _: [], version: true });
    const options = getOptions({ argsOptions: { boolean: ['version'] } });
    const context = await clirk(options);

    expect(context).toEqual(expect.objectContaining({ name: 'test-cli', title: 'Test CLI' }));
    expect(isFlagDefined).toHaveBeenCalledTimes(2);
    expect(isFlagDefined).toHaveBeenNthCalledWith(1, { boolean: ['version'] }, 'help');
    expect(isFlagDefined).toHaveBeenNthCalledWith(2, { boolean: ['version'] }, 'version');
    expect(addFlagsToOptions).toHaveBeenCalledTimes(1);
    expect(addFlagsToOptions).toHaveBeenCalledWith(options, { help: true, version: false });
    expect(generateVersionMessage).not.toHaveBeenCalled();
    expect(gracefulExit).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('handles missing argsOptions and creates options for help and version', async () => {
    const options = getOptions();
    const context = await clirk(options);

    expect(context).toEqual(expect.objectContaining({ name: 'test-cli', title: 'Test CLI' }));
    expect(typeof context.getHelpMessage).toBe('function');
    expect(typeof context.getVersionMessage).toBe('function');
    expect(context.getHelpMessage()).toBe('[help message]');
    expect(context.getVersionMessage()).toBe('[version message]');
    expect(isFlagDefined).toHaveBeenCalledTimes(2);
    expect(isFlagDefined).toHaveBeenNthCalledWith(1, undefined, 'help');
    expect(isFlagDefined).toHaveBeenNthCalledWith(2, undefined, 'version');
    expect(addFlagsToOptions).toHaveBeenCalledTimes(1);
    expect(addFlagsToOptions).toHaveBeenCalledWith(options, { help: true, version: true });
    expect(gracefulExit).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('does not call gracefulExit if help/version are not passed', async () => {
    const options = getOptions();
    const context = await clirk(options);

    expect(context.args).toEqual({ _: [] });
    expect(gracefulExit).not.toHaveBeenCalled();
  });

  it('registers SIGINT handler if provided', async () => {
    const handler = (): void => {};
    const options = getOptions({ sigintHandler: handler });
    const context = await clirk(options);

    expect(context.sigintHandler).toBe(handler);
    expect(on).toHaveBeenCalledWith('SIGINT', handler);
  });

  it('does not register SIGINT handler if there are existing listeners', async () => {
    listenerCount.mockReturnValueOnce(1);
    const options = getOptions({ sigintHandler: () => {} });
    const context = await clirk(options);

    expect(context.sigintHandler).toBeTypeOf('function');
    expect(on).not.toHaveBeenCalledWith('SIGINT', expect.any(Function));
  });

  it('does not register SIGINT handler if sigintHandler is false', async () => {
    const options = getOptions({ sigintHandler: false });
    const context = await clirk(options);

    expect(context.sigintHandler).toBeUndefined();
    expect(on).not.toHaveBeenCalled();
  });
});
