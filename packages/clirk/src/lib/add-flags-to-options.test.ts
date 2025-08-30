import { describe, expect, it } from 'vitest';

import { mockOptions } from '../../tests/mocks.js';

import { addFlagsToOptions } from './add-flags-to-options.js';

describe('addFlagsToOptions', () => {
  it('adds help and version flags to empty config', () => {
    const options = mockOptions();
    addFlagsToOptions(options, { help: true, version: true });

    expect(options.argsOptions.boolean).toEqual(expect.arrayContaining(['help', 'version']));
    expect(options.argsOptions.alias.help).toEqual(['h']);
    expect(options.argsOptions.alias.version).toEqual(['v']);
    expect(options.options.help).toEqual(['Display this help message.']);
    expect(options.options.version).toEqual(['Display the package name and version.']);
  });

  it('does not overwrite existing option descriptions', () => {
    const options = mockOptions({
      options: { help: ['My custom help description.'] },
    });
    addFlagsToOptions(options, { help: true });

    expect(options.options.help).toEqual(['My custom help description.']);
  });

  it('adds only the specified flag', () => {
    const optionsWithHelp = mockOptions();
    addFlagsToOptions(optionsWithHelp, { help: true });

    expect(optionsWithHelp.argsOptions.boolean).toContain('help');
    expect(optionsWithHelp.argsOptions.boolean).not.toContain('version');
    expect(optionsWithHelp.argsOptions.alias.help).toEqual(['h']);
    expect(optionsWithHelp.argsOptions.alias.version).toBeUndefined();
    expect(optionsWithHelp.options.help).toBeDefined();
    expect(optionsWithHelp.options.version).toBeUndefined();

    const optionsWithVersion = mockOptions();
    addFlagsToOptions(optionsWithVersion, { version: true });

    expect(optionsWithVersion.argsOptions.boolean).not.toContain('help');
    expect(optionsWithVersion.argsOptions.boolean).toContain('version');
    expect(optionsWithVersion.argsOptions.alias.help).toBeUndefined();
    expect(optionsWithVersion.argsOptions.alias.version).toEqual(['v']);
    expect(optionsWithVersion.options.help).toBeUndefined();
    expect(optionsWithVersion.options.version).toBeDefined();
  });

  it('merges with existing booleans and aliases without duplicates', () => {
    const options = mockOptions({
      argsOptions: { boolean: ['debug'], alias: { debug: ['d'] }, string: [], default: {} },
    });
    addFlagsToOptions(options, { help: true });

    expect(options.argsOptions.boolean).toEqual(expect.arrayContaining(['debug', 'help']));
    expect(options.argsOptions.alias.debug).toEqual(['d']);
    expect(options.argsOptions.alias.help).toEqual(['h']);
  });

  it('leaves argsOptions and options unchanged if no flags are requested', () => {
    const options = mockOptions({
      argsOptions: { boolean: ['safe'], alias: { safe: ['s'] }, string: [], default: {} },
      options: { safe: ['Enable safe mode.'] },
    });
    addFlagsToOptions(mockOptions(), {});
    expect(options.argsOptions.boolean).toEqual(['safe']);
    expect(options.argsOptions.alias).toEqual({ safe: ['s'] });
    expect(options.options).toEqual({ safe: ['Enable safe mode.'] });
  });
});
