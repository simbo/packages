import { describe, expect, it } from 'vitest';

import type { ClirkOptions } from '../clirk.types.js';

import { addFlagsToOptions } from './add-flags-to-options.js';

const getOptions = (overrides: Partial<ClirkOptions> = {}): ClirkOptions => ({
  importMetaDirname: '/test',
  title: 'Test CLI',
  name: 'test-cli',
  ...overrides,
});

describe('addFlagsToOptions', () => {
  it('adds help and version flags to empty config', () => {
    const result = addFlagsToOptions(getOptions(), { help: true, version: true });

    expect(result.argsOptions?.boolean).toEqual(expect.arrayContaining(['help', 'version']));
    expect(result.argsOptions?.alias?.help).toEqual(['h']);
    expect(result.argsOptions?.alias?.version).toEqual(['v']);
    expect(result.options?.help).toBe('Display this help message.');
    expect(result.options?.version).toBe('Display the package name and version.');
  });

  it('does not overwrite existing option descriptions', () => {
    const result = addFlagsToOptions(
      getOptions({
        options: { help: 'My custom help description.' },
      }),
      { help: true },
    );

    expect(result.options?.help).toBe('My custom help description.');
  });

  it('adds only the specified flag', () => {
    const result = addFlagsToOptions(getOptions(), { help: true });

    expect(result.argsOptions?.boolean).toContain('help');
    expect(result.argsOptions?.boolean).not.toContain('version');
    expect(result.argsOptions?.alias?.help).toEqual(['h']);
    expect(result.argsOptions?.alias?.version).toBeUndefined();
    expect(result.options?.help).toBeDefined();
    expect(result.options?.version).toBeUndefined();
  });

  it('merges with existing booleans and aliases without duplicates', () => {
    const result = addFlagsToOptions(
      getOptions({
        argsOptions: { boolean: ['debug'], alias: { debug: ['d'] } },
      }),
      { help: true },
    );

    expect(result.argsOptions?.boolean).toEqual(expect.arrayContaining(['debug', 'help']));
    expect(result.argsOptions?.alias?.debug).toEqual(['d']);
    expect(result.argsOptions?.alias?.help).toEqual(['h']);
  });

  it('leaves argsOptions and options unchanged if no flags are requested', () => {
    const result = addFlagsToOptions(
      getOptions({
        argsOptions: { boolean: ['safe'], alias: { safe: ['s'] } },
        options: { safe: 'Enable safe mode.' },
      }),
      {},
    );
    expect(result.argsOptions?.boolean).toEqual(['safe']);
    expect(result.argsOptions?.alias).toEqual({ safe: ['s'] });
    expect(result.options).toEqual({ safe: 'Enable safe mode.' });
  });
});
