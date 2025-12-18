import { describe, expect, it } from 'vitest';

import { GitChangeStatus } from './git-change-status.enum.js';
import { parseGitChangeStatus } from './parse-git-change-status.js';

describe.each([
  // valid combinations
  ['M ', { staged: GitChangeStatus.Modified, unstaged: undefined }],
  ['AM', { staged: GitChangeStatus.Added, unstaged: GitChangeStatus.Modified }],
  [' D', { staged: undefined, unstaged: GitChangeStatus.Deleted }],
  ['RC', { staged: GitChangeStatus.Renamed, unstaged: GitChangeStatus.Copied }],
  ['MM', { staged: GitChangeStatus.Modified, unstaged: GitChangeStatus.Modified }],
  ['C ', { staged: GitChangeStatus.Copied, unstaged: undefined }],
  [' R', { staged: undefined, unstaged: GitChangeStatus.Renamed }],
  ['DA', { staged: GitChangeStatus.Deleted, unstaged: GitChangeStatus.Added }],

  // special case
  ['??', { staged: undefined, unstaged: GitChangeStatus.Untracked }],

  // extra length - only first 2 chars matter
  ['MM extra', { staged: GitChangeStatus.Modified, unstaged: GitChangeStatus.Modified }],
  ['?Mlong', { staged: undefined, unstaged: GitChangeStatus.Modified }],
  ['A?more', { staged: GitChangeStatus.Added, unstaged: undefined }],

  // malformed inputs
  ['X ', { staged: undefined, unstaged: undefined }],
  [' Y', { staged: undefined, unstaged: undefined }],
  ['XY', { staged: undefined, unstaged: undefined }],
  ['  ', { staged: undefined, unstaged: undefined }],
  ['X?', { staged: undefined, unstaged: undefined }],
  ['?X', { staged: undefined, unstaged: undefined }],
  ['Z1', { staged: undefined, unstaged: undefined }],

  // invalid: shorter than 2 characters
  ['', { staged: undefined, unstaged: undefined }],
  ['M', { staged: undefined, unstaged: undefined }],
  ['?', { staged: undefined, unstaged: undefined }],
])('parseGitChangeStatus("%s")', (input, expected) => {
  it(`returns ${JSON.stringify(expected)}`, () => {
    expect(parseGitChangeStatus(input)).toEqual(expected);
  });
});
