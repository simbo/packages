import { describe, expect, it } from 'vitest';

import { defineConfig, validateConfig, type Config } from './config-schema.js';

describe('Config Schema', () => {
  describe('validateConfig', () => {
    it('validates the minimum config correctly', () => {
      const result = validateConfig({});
      expect(result).toEqual([
        {
          after: '',
          before: expect.any(Function) as unknown,
          delimiter: '\n\n',
          filterFn: expect.any(Function) as unknown,
          sortCompareFn: expect.any(Function) as unknown,
          templateData: {},
          templateFn: expect.any(Function) as unknown,
          targetFile: 'README.md',
        },
      ]);
    });

    it('accepts a targetFile', () => {
      const result = validateConfig({ targetFile: 'custom.md' });
      expect(result).toEqual([
        {
          after: '',
          before: expect.any(Function) as unknown,
          delimiter: '\n\n',
          filterFn: expect.any(Function) as unknown,
          sortCompareFn: expect.any(Function) as unknown,
          templateData: {},
          templateFn: expect.any(Function) as unknown,
          targetFile: 'custom.md',
        },
      ]);
    });

    it('accepts an array of config objects', () => {
      const result = validateConfig([{ targetFile: 'custom1.md' }, { targetFile: 'custom2.md' }]);
      expect(result).toEqual([
        {
          after: '',
          before: expect.any(Function) as unknown,
          delimiter: '\n\n',
          filterFn: expect.any(Function) as unknown,
          sortCompareFn: expect.any(Function) as unknown,
          templateData: {},
          templateFn: expect.any(Function) as unknown,
          targetFile: 'custom1.md',
        },
        {
          after: '',
          before: expect.any(Function) as unknown,
          delimiter: '\n\n',
          filterFn: expect.any(Function) as unknown,
          sortCompareFn: expect.any(Function) as unknown,
          templateData: {},
          templateFn: expect.any(Function) as unknown,
          targetFile: 'custom2.md',
        },
      ]);
    });

    it('does not accept a working directory option', () => {
      const invalidConfig = {
        workingDir: '/some/path',
      };
      expect(() => validateConfig(invalidConfig as unknown as Config)).toThrow(
        `Validation error: Unrecognized key(s) "workingDir" in object`,
      );
    });

    it('throws an error for invalid config', () => {
      const invalidConfig = {
        someConfig: 'not a boolean',
      };
      expect(() => validateConfig(invalidConfig as unknown as Config)).toThrow(
        `Validation error: Unrecognized key(s) "someConfig" in object`,
      );
    });
  });

  describe('defineConfig', () => {
    it('defines a valid config', () => {
      const obj = {
        targetFile: 'custom.md',
      };
      const result = defineConfig(obj);
      expect(result).toBe(obj);
    });
  });
});
