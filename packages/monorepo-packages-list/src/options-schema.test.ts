import { cwd } from 'node:process';

import type { WorkspaceMetadata } from '@simbo/monorepo-utils';
import { describe, expect, it } from 'vitest';

import { defaultBeforeFn } from './default-before-fn.js';
import { defaultTemplateFn } from './default-template-fn.js';
import type {
  BeforeAfterFn,
  FilterFn,
  SortCompareFn,
  TemplateDataFn,
  TemplateFn,
} from './monorepo-packages-list.types.js';
import { validateOptions } from './options-schema.js';

describe('Options Schema', () => {
  describe('validateOptions', () => {
    it('should accept an empty object', () => {
      const result = validateOptions({});
      expect(result).toBeTruthy();
    });

    it('should set defaults for empty values', () => {
      const result = validateOptions({});
      expect(result).toBeTruthy();
      expect(result.workingDir).toBe(cwd());
      expect(result.templateFn).toBe(defaultTemplateFn);
    });

    describe('workingDir', () => {
      it('should accept a valid directory path', () => {
        const result = validateOptions({ workingDir: '/path/to/dir' });
        expect(result).toBeTruthy();
        expect(result.workingDir).toBe('/path/to/dir');
      });

      it('should throw an error for an invalid directory path', () => {
        expect(() => validateOptions({ workingDir: '' })).toThrow(
          'Validation error: Expected string to contain at least 1 character(s) at "workingDir"',
        );
      });
    });

    describe('templateFn', () => {
      it('should accept a valid function', () => {
        const fn: TemplateFn = () => 'ok';
        const result = validateOptions({ templateFn: fn });
        expect(result).toBeTruthy();
        expect(result.templateFn).toBe(fn);
      });

      it('should throw an error for an invalid value', () => {
        expect(() => validateOptions({ templateFn: 'nope' as unknown as TemplateFn })).toThrow(
          'Validation error: Expected a function at "templateFn"',
        );
      });
    });

    describe('templateData', () => {
      it('should default to an empty object', () => {
        const result = validateOptions({});
        expect(result.templateData).toEqual({});
      });

      it('should accept valid function properties', () => {
        const fn: TemplateDataFn = () => 'x';
        const result = validateOptions({
          templateData: {
            repoUrlFn: fn,
            packageUrlFn: fn,
            docsUrlFn: fn,
            readmeUrlFn: fn,
            changelogUrlFn: fn,
          },
        });
        expect(result.templateData.repoUrlFn).toBe(fn);
        expect(result.templateData.packageUrlFn).toBe(fn);
        expect(result.templateData.docsUrlFn).toBe(fn);
        expect(result.templateData.readmeUrlFn).toBe(fn);
        expect(result.templateData.changelogUrlFn).toBe(fn);
      });

      it('should throw for invalid function properties', () => {
        expect(() => validateOptions({ templateData: { repoUrlFn: 'nope' as unknown as TemplateDataFn } })).toThrow(
          'Validation error: Expected a function at "templateData.repoUrlFn"',
        );
      });
    });

    describe('sortCompareFn', () => {
      it('should default to comparing by relativePath', () => {
        const result = validateOptions({});
        const a = { relativePath: 'a' } as unknown as WorkspaceMetadata;
        const b = { relativePath: 'b' } as unknown as WorkspaceMetadata;
        expect(result.sortCompareFn(a, b)).toBeLessThan(0);
        expect(result.sortCompareFn(b, a)).toBeGreaterThan(0);
      });

      it('should accept a valid compare function', () => {
        const fn: SortCompareFn = () => 0;
        const result = validateOptions({ sortCompareFn: fn });
        expect(result.sortCompareFn).toBe(fn);
      });

      it('should throw an error for an invalid value', () => {
        expect(() => validateOptions({ sortCompareFn: 123 as unknown as SortCompareFn })).toThrow(
          'Validation error: Expected a function at "sortCompareFn"',
        );
      });
    });

    describe('filterFn', () => {
      it('should default to a function that returns true', () => {
        const result = validateOptions({});
        expect(result.filterFn({} as unknown as WorkspaceMetadata)).toBe(true);
      });

      it('should accept a valid predicate function', () => {
        const fn: FilterFn = () => false;
        const result = validateOptions({ filterFn: fn });
        expect(result.filterFn).toBe(fn);
      });

      it('should throw an error for an invalid value', () => {
        expect(() => validateOptions({ filterFn: 'nope' as unknown as FilterFn })).toThrow(
          'Validation error: Expected a function at "filterFn"',
        );
      });
    });

    describe('delimiter', () => {
      it('should default to a double newline', () => {
        const result = validateOptions({});
        expect(result.delimiter).toBe('\n\n');
      });

      it('should accept a custom delimiter', () => {
        const result = validateOptions({ delimiter: '---' });
        expect(result.delimiter).toBe('---');
      });
    });

    describe('before', () => {
      it('should default to defaultBeforeFn', () => {
        const result = validateOptions({});
        expect(result.before).toBe(defaultBeforeFn);
      });

      it('should accept a string', () => {
        const result = validateOptions({ before: 'HEADER' });
        expect(result.before).toBe('HEADER');
      });

      it('should accept a function', () => {
        const fn: BeforeAfterFn = () => 'header';
        const result = validateOptions({ before: fn });
        expect(result.before).toBe(fn);
      });
    });

    describe('after', () => {
      it('should default to an empty string', () => {
        const result = validateOptions({});
        expect(result.after).toBe('');
      });

      it('should accept a string', () => {
        const result = validateOptions({ after: 'FOOTER' });
        expect(result.after).toBe('FOOTER');
      });

      it('should accept a function', () => {
        const fn: BeforeAfterFn = () => 'footer';
        const result = validateOptions({ after: fn });
        expect(result.after).toBe(fn);
      });
    });
  });
});
