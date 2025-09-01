import { describe, expect, it } from 'vitest';

import { validateArgs } from './args-schema.js';

describe('Args Schema', () => {
  describe('validateArgs', () => {
    it('validates the minimum args correctly', () => {
      const result = validateArgs({});
      expect(result).toEqual({
        configFile: undefined,
        targetFiles: [],
      });
    });

    it('accepts a configFile', () => {
      const result = validateArgs({ config: 'custom.js' });
      expect(result).toEqual({
        configFile: 'custom.js',
        targetFiles: [],
      });
    });

    it('takes only the first when multiple config files are provided', () => {
      const result = validateArgs({ config: ['custom1.js', 'custom2.js'] });
      expect(result).toEqual({
        configFile: 'custom1.js',
        targetFiles: [],
      });
    });

    it('accepts targetFiles', () => {
      const result = validateArgs({ _: ['file1.txt', 'file2.txt'] });
      expect(result).toEqual({
        configFile: undefined,
        targetFiles: ['file1.txt', 'file2.txt'],
      });
    });
  });
});
