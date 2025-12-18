import { describe, expect, it } from 'vitest';

import { GitChangeStatus } from './git-change-status.enum.js';
import { parseGitStatusOutput } from './parse-git-status-output.js';

/**
 * Helper to convert a ReadonlyMap to a Record for easier test assertions.
 *
 * @param map - The ReadonlyMap to convert.
 * @returns A Record with the same entries as the map.
 */
function toRecord(map: ReadonlyMap<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(map.entries());
}

describe('parseGitStatusOutput()', () => {
  describe('basic parsing & filtering', () => {
    it.each([
      {
        title: 'returns an empty map for an empty string',
        output: '',
        expected: {},
      },
      {
        title: 'returns an empty map for a single separator',
        output: '\0',
        expected: {},
      },
      {
        title: 'skips empty entries between separators',
        output: '\0\0\0',
        expected: {},
      },
      {
        title: 'ignores entries with missing path',
        // status chars exist, but there is no path after the required space
        output: 'M  \0',
        expected: {},
      },
      {
        title: 'ignores entries with no staged/unstaged status (both spaces)',
        output: '   file.txt\0',
        expected: {},
      },
      {
        title: 'ignores entries with unknown status characters',
        output: 'ZZ file.txt\0',
        expected: {},
      },
      {
        title: 'parses a single untracked file',
        output: '?? untracked.ts\0',
        expected: {
          'untracked.ts': {
            path: 'untracked.ts',
            staged: undefined,
            unstaged: GitChangeStatus.Untracked,
          },
        },
      },
      {
        title: 'parses a single staged modified file',
        output: 'M  staged-modified.ts\0',
        expected: {
          'staged-modified.ts': {
            path: 'staged-modified.ts',
            staged: GitChangeStatus.Modified,
            unstaged: undefined,
          },
        },
      },
      {
        title: 'parses a single unstaged modified file',
        output: ' M unstaged-modified.ts\0',
        expected: {
          'unstaged-modified.ts': {
            path: 'unstaged-modified.ts',
            staged: undefined,
            unstaged: GitChangeStatus.Modified,
          },
        },
      },
      {
        title: 'parses a file modified in both staged and unstaged',
        output: 'MM both-modified.ts\0',
        expected: {
          'both-modified.ts': {
            path: 'both-modified.ts',
            staged: GitChangeStatus.Modified,
            unstaged: GitChangeStatus.Modified,
          },
        },
      },
      {
        title: 'parses deletions (staged and unstaged variants)',
        output: ' D unstaged-deleted.ts\0D  staged-deleted.ts\0',
        expected: {
          'unstaged-deleted.ts': {
            path: 'unstaged-deleted.ts',
            staged: undefined,
            unstaged: GitChangeStatus.Deleted,
          },
          'staged-deleted.ts': {
            path: 'staged-deleted.ts',
            staged: GitChangeStatus.Deleted,
            unstaged: undefined,
          },
        },
      },
      {
        title: 'parses additions (staged added)',
        output: 'A  staged-added.ts\0',
        expected: {
          'staged-added.ts': {
            path: 'staged-added.ts',
            staged: GitChangeStatus.Added,
            unstaged: undefined,
          },
        },
      },
      {
        title: 'treats newlines as part of the path when no null separators are used',
        // Not the intended format (because ENTRY_SEPARATOR is \0), but we still verify current behavior.
        output: 'M  a.ts\nM  b.ts\n',
        expected: {
          'a.ts\nM  b.ts\n': {
            path: 'a.ts\nM  b.ts\n',
            staged: GitChangeStatus.Modified,
            unstaged: undefined,
          },
        },
      },
    ])('$title', ({ output, expected }) => {
      const result = parseGitStatusOutput(output);
      expect(toRecord(result)).toEqual(expected);
    });
  });

  describe('multi-entry output', () => {
    it('parses a mixed multi-entry output', () => {
      const output = [
        '?? untracked.ts',
        ' M unstaged-modified.ts',
        'M  staged-modified.ts',
        'MM both-modified.ts',
        ' D unstaged-deleted.ts',
        'A  staged-added.ts',
        '',
      ].join('\0');

      const result = parseGitStatusOutput(output);

      expect(toRecord(result)).toEqual({
        'untracked.ts': {
          path: 'untracked.ts',
          staged: undefined,
          unstaged: GitChangeStatus.Untracked,
        },
        'unstaged-modified.ts': {
          path: 'unstaged-modified.ts',
          staged: undefined,
          unstaged: GitChangeStatus.Modified,
        },
        'staged-modified.ts': {
          path: 'staged-modified.ts',
          staged: GitChangeStatus.Modified,
          unstaged: undefined,
        },
        'both-modified.ts': {
          path: 'both-modified.ts',
          staged: GitChangeStatus.Modified,
          unstaged: GitChangeStatus.Modified,
        },
        'unstaged-deleted.ts': {
          path: 'unstaged-deleted.ts',
          staged: undefined,
          unstaged: GitChangeStatus.Deleted,
        },
        'staged-added.ts': {
          path: 'staged-added.ts',
          staged: GitChangeStatus.Added,
          unstaged: undefined,
        },
      });
    });

    it('keeps the last entry when the same path appears multiple times', () => {
      const output = [' M file.ts', 'MM file.ts', 'M  file.ts', ''].join('\0');
      const result = parseGitStatusOutput(output);

      // The last occurrence wins due to Map#set overwriting.
      expect(toRecord(result)).toEqual({
        'file.ts': {
          path: 'file.ts',
          staged: GitChangeStatus.Modified,
          unstaged: undefined,
        },
      });
    });
  });

  describe('rename and copy entries', () => {
    it.each([
      {
        title: 'parses a staged rename (R  old -> new) using the next entry as target path',
        output: 'R  old.ts\0new.ts\0',
        expected: {
          'new.ts': {
            path: 'new.ts',
            originPath: 'old.ts',
            staged: GitChangeStatus.Renamed,
            unstaged: undefined,
          },
        },
      },
      {
        title: 'parses a staged copy (C  source -> copied) using the next entry as target path',
        output: 'C  source.ts\0copied.ts\0',
        expected: {
          'copied.ts': {
            path: 'copied.ts',
            originPath: 'source.ts',
            staged: GitChangeStatus.Copied,
            unstaged: undefined,
          },
        },
      },
      {
        title: 'parses an unstaged rename ( R old -> new) using the next entry as target path',
        output: ' R old.ts\0new.ts\0',
        expected: {
          'new.ts': {
            path: 'new.ts',
            originPath: 'old.ts',
            staged: undefined,
            unstaged: GitChangeStatus.Renamed,
          },
        },
      },
      {
        title: 'parses an unstaged copy ( C source -> copied) using the next entry as target path',
        output: ' C source.ts\0copied.ts\0',
        expected: {
          'copied.ts': {
            path: 'copied.ts',
            originPath: 'source.ts',
            staged: undefined,
            unstaged: GitChangeStatus.Copied,
          },
        },
      },
    ])('$title', ({ output, expected }) => {
      const result = parseGitStatusOutput(output);
      expect(toRecord(result)).toEqual(expected);
    });

    it('skips rename entries when the target path is missing', () => {
      // There is no second entry after the rename entry.
      const output = 'R  old.ts\0';
      const result = parseGitStatusOutput(output);

      expect(toRecord(result)).toEqual({});
    });

    it('skips rename entries when the target path is an empty string', () => {
      // Double separator creates an empty targetPath entry.
      const output = 'R  old.ts\0\0';
      const result = parseGitStatusOutput(output);

      expect(toRecord(result)).toEqual({});
    });

    it('parses a rename followed by other entries (index handling)', () => {
      const output = ['R  a.ts', 'b.ts', 'M  after.ts', ''].join('\0');
      const result = parseGitStatusOutput(output);

      expect(toRecord(result)).toEqual({
        'b.ts': {
          path: 'b.ts',
          originPath: 'a.ts',
          staged: GitChangeStatus.Renamed,
          unstaged: undefined,
        },
        'after.ts': {
          path: 'after.ts',
          staged: GitChangeStatus.Modified,
          unstaged: undefined,
        },
      });
    });
  });
});
