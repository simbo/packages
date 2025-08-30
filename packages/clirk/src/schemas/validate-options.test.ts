import { describe, expect, it, vi } from 'vitest';

import type { ClirkOptions } from '../types/clirk-options.interface.js';

import { validateOptions } from './validate-options.js';

vi.mock('./options-defaults.js', () => ({
  DEFAULT_MINIMIST_OPTIONS: { string: [], boolean: [], alias: {}, default: {} },
  DEFAULT_USAGE_LABEL: 'DEFAULT USAGE',
  DEFAULT_PARAMETERS_LABEL: 'DEFAULT PARAMETERS',
  DEFAULT_OPTIONS_LABEL: 'DEFAULT OPTIONS',
  DEFAULT_SIGINT_MESSAGE: 'DEFAULT MESSAGE',
  DEFAULT_SIGINT_HANDLER: vi.fn(),
}));

const { DEFAULT_SIGINT_HANDLER } = vi.mocked(await import('./options-defaults.js'));

describe('validateOptions', () => {
  it('should validate minimum options', () => {
    const options = {
      importMetaDirname: '/path/to/pkg',
      title: 'Test CLI',
    };
    const result = validateOptions(options);

    expect(result).toEqual({
      importMetaDirname: '/path/to/pkg',
      title: 'Test CLI',
      argsOptions: {
        alias: {},
        boolean: [],
        default: {},
        string: [],
      },
      description: [],
      examples: [],
      options: {},
      optionsLabel: 'DEFAULT OPTIONS',
      parameters: {},
      parametersLabel: 'DEFAULT PARAMETERS',
      sigintHandler: DEFAULT_SIGINT_HANDLER,
      sigintMessage: 'DEFAULT MESSAGE',
      usage: [],
      usageLabel: 'DEFAULT USAGE',
    });
    expect(DEFAULT_SIGINT_HANDLER).not.toHaveBeenCalled();
  });

  it('should throw if importMetaDirname is undefined', () => {
    const options = {
      title: 'Test CLI',
    } as unknown as ClirkOptions;
    expect(() => validateOptions(options)).toThrow(
      'Validation error: Expected string, received undefined at "importMetaDirname"',
    );
  });

  it('should throw if importMetaDirname is an empty string', () => {
    const options = {
      title: 'Test CLI',
      importMetaDirname: '',
    };
    expect(() => validateOptions(options)).toThrow(
      'Validation error: Expected a non-empty string at "importMetaDirname"',
    );
  });

  it('should throw if title is undefined', () => {
    const options = {
      title: '',
      importMetaDirname: '/path/to/pkg',
    };
    expect(() => validateOptions(options)).toThrow('Validation error: Expected a non-empty string at "title"');
  });

  it('should throw if title is an empty string', () => {
    const options = {
      title: '',
      importMetaDirname: '/path/to/pkg',
    };
    expect(() => validateOptions(options)).toThrow('Validation error: Expected a non-empty string at "title"');
  });

  it('should accept optional name and icon when provided', () => {
    const result = validateOptions({
      importMetaDirname: '/x',
      title: 'T',
      name: 'clirk',
      icon: '✨',
    });

    expect(result.name).toBe('clirk');
    expect(result.icon).toBe('✨');
  });

  it('should throw if optional name is an empty string when provided', () => {
    const options = {
      importMetaDirname: '/x',
      title: 'T',
      name: '',
    } as unknown as ClirkOptions;

    expect(() => validateOptions(options)).toThrow('Validation error: Expected a non-empty string at "name"');
  });

  it('should throw if optional icon is an empty string when provided', () => {
    const options = {
      importMetaDirname: '/x',
      title: 'T',
      icon: '',
    } as unknown as ClirkOptions;

    expect(() => validateOptions(options)).toThrow('Validation error: Expected a non-empty string at "icon"');
  });

  it('should normalize single string values to arrays for description/examples/usage', () => {
    const result = validateOptions({
      importMetaDirname: '/x',
      title: 'T',
      description: 'd1',
      examples: 'e1',
      usage: 'u1',
    });

    expect(result.description).toEqual(['d1']);
    expect(result.examples).toEqual(['e1']);
    expect(result.usage).toEqual(['u1']);
  });

  it('should keep array values as-is for description/examples/usage', () => {
    const result = validateOptions({
      importMetaDirname: '/x',
      title: 'T',
      description: ['d1', 'd2'],
      examples: ['e1', 'e2'],
      usage: ['u1', 'u2'],
    });

    expect(result.description).toEqual(['d1', 'd2']);
    expect(result.examples).toEqual(['e1', 'e2']);
    expect(result.usage).toEqual(['u1', 'u2']);
  });

  it('should normalize parameters and options record values to string arrays', () => {
    const result = validateOptions({
      importMetaDirname: '/x',
      title: 'T',
      parameters: {
        input: 'Path to file',
        mode: ['fast', 'safe'],
      },
      options: {
        '--debug': 'Enable debug output',
        '--tag': ['Add a tag', 'Repeatable'],
      },
    });

    expect(result.parameters).toEqual({
      input: ['Path to file'],
      mode: ['fast', 'safe'],
    });

    expect(result.options).toEqual({
      '--debug': ['Enable debug output'],
      '--tag': ['Add a tag', 'Repeatable'],
    });
  });

  it('should override label fields when provided', () => {
    const result = validateOptions({
      importMetaDirname: '/x',
      title: 'T',
      usageLabel: 'USAGE!',
      parametersLabel: 'PARAMS!',
      optionsLabel: 'OPTS!',
    });

    expect(result.usageLabel).toBe('USAGE!');
    expect(result.parametersLabel).toBe('PARAMS!');
    expect(result.optionsLabel).toBe('OPTS!');
  });

  it('should apply and normalize minimist argsOptions when provided as strings/arrays', () => {
    const result = validateOptions({
      importMetaDirname: '/x',
      title: 'T',
      argsOptions: {
        string: 's',
        boolean: ['b1', 'b2'],
        alias: { a: 'alpha', b: ['bravo', 'beta'] },
        default: { s: 'val', n: 1, t: true, o: { nested: 'ok' } },
      },
    });

    expect(result.argsOptions).toEqual({
      string: ['s'],
      boolean: ['b1', 'b2'],
      alias: { a: ['alpha'], b: ['bravo', 'beta'] },
      default: { s: 'val', n: 1, t: true, o: { nested: 'ok' } },
    });
  });

  it('should use default minimist options when argsOptions is omitted', () => {
    const result = validateOptions({ importMetaDirname: '/x', title: 'T' });

    expect(result.argsOptions).toEqual({
      string: [],
      boolean: [],
      alias: {},
      default: {},
    });
  });

  it('should throw when argsOptions.string contains empty strings', () => {
    const options = {
      importMetaDirname: '/x',
      title: 'T',
      argsOptions: { string: ['ok', ''] },
    } as unknown as ClirkOptions;

    expect(() => validateOptions(options)).toThrow(
      /Validation error: Expected a non-empty string.*argsOptions\.string\[1]/,
    );
  });

  it('should throw when argsOptions.boolean contains empty strings', () => {
    const options = {
      importMetaDirname: '/x',
      title: 'T',
      argsOptions: { boolean: [''] },
    } as unknown as ClirkOptions;

    expect(() => validateOptions(options)).toThrow(
      /Validation error: Expected a non-empty string.*argsOptions\.boolean\[0]/,
    );
  });

  it('should throw when argsOptions.alias has empty strings', () => {
    const withEmptyKey = {
      importMetaDirname: '/x',
      title: 'T',
      argsOptions: { alias: { x: '', '': 'y' } },
    } as unknown as ClirkOptions;

    expect(() => validateOptions(withEmptyKey)).toThrow(
      /^Validation error: Expected a non-empty string at "argsOptions.alias.x"; Unexpected key in record at "argsOptions.alias\[""]"$/,
    );

    const withEmptyValue = {
      importMetaDirname: '/x',
      title: 'T',
      argsOptions: { alias: { a: ['ok', ''] } },
    } as unknown as ClirkOptions;

    expect(() => validateOptions(withEmptyValue)).toThrow(
      /Validation error: Expected a non-empty string.*argsOptions\.alias\.a\[1]/,
    );
  });

  it('should keep minimist default values as-is (any type allowed)', () => {
    const result = validateOptions({
      importMetaDirname: '/x',
      title: 'T',
      argsOptions: { default: { s: 'x', n: 0, b: false, o: { k: 'v' }, a: [1, 2] } },
    });

    expect(result.argsOptions.default).toEqual({ s: 'x', n: 0, b: false, o: { k: 'v' }, a: [1, 2] });
  });

  it('should accept a custom sigintHandler function', () => {
    const custom = vi.fn();
    const result = validateOptions({ importMetaDirname: '/x', title: 'T', sigintHandler: custom });

    expect(result.sigintHandler).toBe(custom);
  });

  it('should allow disabling sigintHandler with false', () => {
    const result = validateOptions({ importMetaDirname: '/x', title: 'T', sigintHandler: false });
    expect(result.sigintHandler).toBe(false);
  });

  it('should override sigintMessage when provided', () => {
    const result = validateOptions({ importMetaDirname: '/x', title: 'T', sigintMessage: 'STOP' });
    expect(result.sigintMessage).toBe('STOP');
  });

  it('should reject unknown/extra properties due to strict object schema', () => {
    const options = {
      importMetaDirname: '/x',
      title: 'T',
      extra: 'nope',
    } as unknown as ClirkOptions;

    expect(() => validateOptions(options)).toThrow(/Unrecognized key\(s\) in object|Unrecognized key/);
  });
});
