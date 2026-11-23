import { describe, expect, expectTypeOf, it } from 'vitest';

import * as gitConstants from './git-constants.js';

describe('git-constants', () => {
  it('should provide only non-empty string or positive number constants', () => {
    const unexpected: unknown[] = [];
    for (const [key, value] of Object.entries(gitConstants) as [string, unknown][]) {
      const isString = typeof value === 'string';
      const isNumber = typeof value === 'number';
      const isEmptyString = isString && value.trim() === '';
      const isNegativeNumber = isNumber && value < 0;

      if (isEmptyString || isNegativeNumber || (!isString && !isNumber)) {
        unexpected.push([key, value]);
      }
    }
    expect(unexpected).toEqual([]);
  });

  it('should export only string/number literals (type-level)', () => {
    // A type to test if T is a *literal* string/number
    type IsLiteral<T> = T extends string
      ? string extends T
        ? false
        : true
      : T extends number
        ? number extends T
          ? false
          : true
        : false;

    // Compute the keys of T whose values are *not* literal strings/numbers
    type BadKeys<T> = { [K in keyof T]-?: IsLiteral<T[K]> extends true ? never : K }[keyof T];

    // Get all keys of the gitConstants object
    type All = typeof gitConstants;

    // Compute invalid keys
    type NotLiteralKeys = BadKeys<All>;

    // Fails with to compile if any value is not a literal string/number.
    // (Error: "arguments for MISMATCH not provided")
    expectTypeOf<NotLiteralKeys>().toEqualTypeOf<never>();
  });
});
