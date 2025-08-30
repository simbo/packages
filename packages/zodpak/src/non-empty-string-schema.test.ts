import { describe, expect, it } from 'vitest';

import {
  nonEmptyStringArraySchema,
  nonEmptyStringOrArrayOfStringsSchema,
  nonEmptyStringSchema,
} from './non-empty-string-schema.js';

describe('nonEmptyStringSchema', () => {
  describe.each<string>(['a', '0', ' ', 'hello', '✅'])('valid: %j', value => {
    it('parse() returns the same string', () => {
      expect(nonEmptyStringSchema.parse(value)).toBe(value);
    });

    it('safeParse() succeeds', () => {
      const result = nonEmptyStringSchema.safeParse(value);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(value);
      }
    });
  });

  describe.each<unknown>([
    '', // empty string → too small (custom message)
    undefined, // wrong type
    123, // wrong type
    {}, // wrong type
    [], // wrong type
  ])('invalid: %j', value => {
    it('parse() throws', () => {
      expect(() => nonEmptyStringSchema.parse(value)).toThrow();
    });

    it('safeParse() fails with expected diagnostics', () => {
      const result = nonEmptyStringSchema.safeParse(value);
      expect(result.success).toBe(false);

      if (!result.success) {
        const issues = result.error.issues;

        // For the empty string, assert our custom message is present.
        if (value === '') {
          expect(issues[0]?.message).toBe('Expected non-empty string');
          // The code for min(1) is "too_small" for strings; assert defensively:
          expect(issues[0]?.code).toBe('too_small');
        } else {
          // For non-string inputs we at least assert we got an error.
          expect(issues.length).toBeGreaterThan(0);
        }
      }
    });
  });
});

describe('nonEmptyStringArraySchema', () => {
  describe.each<string[][]>([[[]], [['a']], [['a', 'b']], [[' ']], [['x', '✅', '0']]])('valid: %j', value => {
    it('parse() returns the same array', () => {
      expect(nonEmptyStringArraySchema.parse(value)).toEqual(value);
    });

    it('safeParse() succeeds', () => {
      const result = nonEmptyStringArraySchema.safeParse(value);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(value);
      }
    });
  });

  describe.each<unknown>([
    'a', // not an array
    123, // not an array
    {}, // not an array
    [1, 2, 3], // array with wrong element types
    ['a', ''], // contains an empty string → element error at index 1
    [''], // single empty string
    ['ok', undefined as never], // contains undefined
  ])('invalid: %j', value => {
    it('safeParse() fails and points to the correct issue when applicable', () => {
      const result = nonEmptyStringArraySchema.safeParse(value);
      expect(result.success).toBe(false);

      if (!result.success) {
        // If it *is* an array, we can assert element error path/index.
        if (Array.isArray(value)) {
          const idx = value.findIndex(v => v === '' || typeof v !== 'string');
          // Find the first issue that has a path pointing to an index
          const issueForFirstBad =
            result.error.issues.find(i => typeof i.path[0] === 'number') ?? result.error.issues[0];

          expect(typeof issueForFirstBad.path[0]).toBe('number');
          // If the array contained an explicit empty string, we expect the custom message.
          if (idx !== -1 && value[idx] === '') {
            expect(issueForFirstBad.message).toBe('Expected non-empty string');
          }
        } else {
          // Non-array inputs: just ensure we got a type error of some kind.
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      }
    });
  });
});

describe('nonEmptyStringOrArrayOfStringsSchema', () => {
  describe.each<unknown>([
    'a',
    '0',
    ' ',
    ['a'],
    ['a', 'b', '✅'],
    [], // empty array is allowed by the underlying array schema
  ])('valid: %j', value => {
    it('safeParse() succeeds for string or array branch', () => {
      const result = nonEmptyStringOrArrayOfStringsSchema.safeParse(value);
      expect(result.success).toBe(true);
      if (result.success) {
        // Strings come back as string; arrays as array
        if (typeof value === 'string') {
          expect(typeof result.data).toBe('string');
          expect(result.data).toBe(value);
        } else {
          expect(Array.isArray(result.data)).toBe(true);
          expect(result.data).toEqual(value);
        }
      }
    });
  });

  describe.each<unknown>([
    123,
    {},
    ['a', ''], // inner element violates non-empty constraint
    [1, 2, 3],
    undefined,
  ])('invalid: %j', value => {
    it('safeParse() fails (neither valid string nor valid string-array)', () => {
      const result = nonEmptyStringOrArrayOfStringsSchema.safeParse(value);
      expect(result.success).toBe(false);

      if (!result.success) {
        // If the input is an array containing an empty string, assert the nested custom message.
        if (Array.isArray(value) && value.includes('')) {
          const issueForEmpty = result.error.issues.find(i => i.message === 'Expected non-empty string');
          expect(issueForEmpty).toBeDefined();
        } else {
          // Otherwise, we just ensure there is at least one issue.
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      }
    });
  });
});
