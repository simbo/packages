import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import { ValidationError } from 'zod-validation-error';

import { createValidationFunction } from './create-validation-function.js';

describe('createValidationFunction', () => {
  it('returns a validator function for a given schema', () => {
    const schema = z.string();
    const validate = createValidationFunction(schema);
    expect(typeof validate).toBe('function');
  });

  it('validates and returns the parsed value on success (primitive schema)', () => {
    const schema = z.number().int().min(0);
    const validate = createValidationFunction(schema);

    const input = 42;
    const output = validate(input);

    expect(output).toBe(42);

    // Type-level assertion (compile-time)
    expectTypeOf(output).toEqualTypeOf<number>();
  });

  it('validates and returns the parsed value on success (object schema)', () => {
    const schema = z.object({
      id: z.uuid(),
      name: z.string().min(1),
      tags: z.array(z.string().min(1)).default([]),
    });

    const validate = createValidationFunction(schema);

    const input = {
      id: '00000000-0000-4000-8000-000000000000',
      name: 'Alice',
      // tags omitted to exercise defaults
    };

    const output = validate(input);

    expect(output).toEqual({
      id: '00000000-0000-4000-8000-000000000000',
      name: 'Alice',
      tags: [],
    });

    // Type-level assertion (compile-time)
    expectTypeOf(output).toEqualTypeOf<{
      id: string;
      name: string;
      tags: string[];
    }>();
  });

  it('throws a ValidationError (from zod-validation-error) on failure (primitive)', () => {
    const schema = z.number().int().min(10);
    const validate = createValidationFunction(schema);

    try {
      validate('not-a-number');
      // If no error is thrown, fail the test explicitly.
      expect.unreachable('Expected ValidationError to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      // The human-friendly message should mention the general validation context.
      expect(String(error)).toMatch(/validation/i);
    }
  });

  it('throws a ValidationError with useful path info for nested schemas', () => {
    const schema = z.object({
      user: z.object({
        profile: z.object({
          age: z.number().int().min(18),
          email: z.email(),
        }),
      }),
    });

    const validate = createValidationFunction(schema);

    const badInput = {
      user: {
        profile: {
          age: 16, // too small
          email: 'not-an-email', // invalid email
        },
      },
    };

    try {
      validate(badInput);
      expect.unreachable('Expected ValidationError to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);

      const message = String(error);

      // Assert that the message includes nested paths to help users locate issues.
      // We avoid relying on exact phrasing; we just check for the path & hints.
      expect(message).toMatch(/user/i);
      expect(message).toMatch(/profile/i);
      expect(message).toMatch(/age/i);
      expect(message).toMatch(/email/i);

      // Hints for the kinds of problems:
      expect(message).toMatch(/min|at least|greater than/i);
      expect(message).toMatch(/email/i);
    }
  });

  it('surfaces multiple issues in a single thrown ValidationError', () => {
    const schema = z.object({
      title: z.string().min(1),
      count: z.number().int().nonnegative(),
      items: z.array(z.object({ id: z.uuid() })),
    });

    const validate = createValidationFunction(schema);

    const badInput = {
      title: '', // empty
      count: -1, // negative
      items: [{ id: 'nope' }, { id: 'also-bad' }], // invalid uuids
    };

    try {
      validate(badInput);
      expect.unreachable('Expected ValidationError to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const message = String(error);

      // Check that multiple distinct problems appear somewhere in the message.
      expect(message).toMatch(/title/i);
      expect(message).toMatch(/count/i);
      expect(message).toMatch(/items/i);
    }
  });

  it('works with schemas that transform data', () => {
    const schema = z.string().transform(s => s.trim().toUpperCase());
    const validate = createValidationFunction(schema);

    const output = validate('  hello ');
    expect(output).toBe('HELLO');

    // Type-level: output is inferred from z.output<S>
    expectTypeOf(output).toEqualTypeOf<string>();
  });

  it('preserves input vs output typing (z.input vs z.output)', () => {
    // input: string | number; output: number
    const schema = z.union([z.string(), z.number()]).transform(v => (typeof v === 'string' ? Number(v) : v));

    const validate = createValidationFunction(schema);

    const n1 = validate(5);
    const n2 = validate('6');

    expect(n1).toBe(5);
    expect(n2).toBe(6);

    // Type-level checks
    expectTypeOf<Parameters<typeof validate>[0]>().toEqualTypeOf<unknown>();
    expectTypeOf<ReturnType<typeof validate>>().toEqualTypeOf<number>();
  });
});
