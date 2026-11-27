import { afterEach, describe, expect, it, vi } from 'vitest';

import { parseBoolean } from './parse-boolean.js';

describe('parseBoolean', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(['true', 'True', 'TRUE'])('returns true for %j', value => {
    vi.stubEnv('INPUT_DRY-RUN', value);
    expect(parseBoolean('dry-run', false)).toBe(true);
  });

  it.each(['false', 'False', 'FALSE'])('returns false for %j', value => {
    vi.stubEnv('INPUT_DRY-RUN', value);
    expect(parseBoolean('dry-run', true)).toBe(false);
  });

  it('ignores surrounding whitespace', () => {
    vi.stubEnv('INPUT_DRY-RUN', '  true\n');
    expect(parseBoolean('dry-run', false)).toBe(true);
  });

  it.each([true, false])('returns the default %j if the input is empty', defaultValue => {
    vi.stubEnv('INPUT_DRY-RUN', '');
    expect(parseBoolean('dry-run', defaultValue)).toBe(defaultValue);
  });

  it('returns the default if the input is not set', () => {
    vi.stubEnv('INPUT_DRY-RUN', undefined);
    expect(parseBoolean('dry-run', true)).toBe(true);
  });

  it.each(['tRuE', 'yes', 'no', 'on', '1', '0', 'y'])('rejects %j and names the input', value => {
    vi.stubEnv('INPUT_DRY-RUN', value);
    expect(() => parseBoolean('dry-run', false)).toThrow(
      `Invalid input "dry-run": "${value}" (expected one of: true, True, TRUE, false, False, FALSE).`,
    );
  });
});
