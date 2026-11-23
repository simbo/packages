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
  [' A', { staged: undefined, unstaged: GitChangeStatus.Added }],
  ['T ', { staged: GitChangeStatus.TypeChanged, unstaged: undefined }],
  [' T', { staged: undefined, unstaged: GitChangeStatus.TypeChanged }],
  ['MT', { staged: GitChangeStatus.Modified, unstaged: GitChangeStatus.TypeChanged }],
  ['?M', { staged: undefined, unstaged: GitChangeStatus.Modified }],
  ['M?', { staged: GitChangeStatus.Modified, unstaged: undefined }],

  // special case: untracked
  ['??', { staged: undefined, unstaged: GitChangeStatus.Untracked }],

  // special case: unmerged (merge conflicts)
  ['DD', { staged: GitChangeStatus.Unmerged, unstaged: GitChangeStatus.Unmerged }],
  ['AU', { staged: GitChangeStatus.Unmerged, unstaged: GitChangeStatus.Unmerged }],
  ['UD', { staged: GitChangeStatus.Unmerged, unstaged: GitChangeStatus.Unmerged }],
  ['UA', { staged: GitChangeStatus.Unmerged, unstaged: GitChangeStatus.Unmerged }],
  ['DU', { staged: GitChangeStatus.Unmerged, unstaged: GitChangeStatus.Unmerged }],
  ['AA', { staged: GitChangeStatus.Unmerged, unstaged: GitChangeStatus.Unmerged }],
  ['UU', { staged: GitChangeStatus.Unmerged, unstaged: GitChangeStatus.Unmerged }],
  ['UUextra', { staged: GitChangeStatus.Unmerged, unstaged: GitChangeStatus.Unmerged }],

  // "U" outside of unmerged combinations is not a valid status
  ['U ', { staged: undefined, unstaged: undefined }],
  [' U', { staged: undefined, unstaged: undefined }],
  ['UM', { staged: undefined, unstaged: GitChangeStatus.Modified }],

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
