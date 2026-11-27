import { afterEach, describe, expect, it, vi } from 'vitest';

import { parseOption } from './parse-option.js';

const OPTIONS = ['error', 'warn', 'ignore'] as const;

describe('parseOption', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(OPTIONS)('returns the option %j', option => {
    vi.stubEnv('INPUT_IF-NO-CHANGES', option);
    expect(parseOption('if-no-changes', OPTIONS, 'error')).toBe(option);
  });

  it('ignores surrounding whitespace', () => {
    vi.stubEnv('INPUT_IF-NO-CHANGES', ' warn ');
    expect(parseOption('if-no-changes', OPTIONS, 'error')).toBe('warn');
  });

  it('returns the default if the input is empty', () => {
    vi.stubEnv('INPUT_IF-NO-CHANGES', '');
    expect(parseOption('if-no-changes', OPTIONS, 'ignore')).toBe('ignore');
  });

  it('returns the default if the input is not set', () => {
    vi.stubEnv('INPUT_IF-NO-CHANGES', undefined);
    expect(parseOption('if-no-changes', OPTIONS, 'warn')).toBe('warn');
  });

  it.each(['Error', 'WARN', 'skip'])('rejects %j and lists the options', value => {
    vi.stubEnv('INPUT_IF-NO-CHANGES', value);
    expect(() => parseOption('if-no-changes', OPTIONS, 'error')).toThrow(
      `Invalid input "if-no-changes": "${value}" (expected one of: error, warn, ignore).`,
    );
  });
});
