import { afterEach, describe, expect, it, vi } from 'vitest';

import { parseRepository } from './parse-repository.js';

describe('parseRepository', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('splits the input into owner and repository name', () => {
    vi.stubEnv('INPUT_REPOSITORY', 'octo-org/my_repo.js');
    vi.stubEnv('GITHUB_REPOSITORY', 'other/repo');
    expect(parseRepository()).toEqual({ owner: 'octo-org', repo: 'my_repo.js' });
  });

  it('reads the input of the given name', () => {
    vi.stubEnv('INPUT_TARGET-REPOSITORY', 'octo-org/target');
    vi.stubEnv('INPUT_REPOSITORY', 'octo-org/other');
    expect(parseRepository('target-repository')).toEqual({ owner: 'octo-org', repo: 'target' });
  });

  it('falls back to the repository of the workflow', () => {
    vi.stubEnv('INPUT_REPOSITORY', '');
    vi.stubEnv('GITHUB_REPOSITORY', 'octo-org/workflow');
    expect(parseRepository()).toEqual({ owner: 'octo-org', repo: 'workflow' });
  });

  it('requires the input if the repository of the workflow is not set', () => {
    vi.stubEnv('INPUT_REPOSITORY', undefined);
    vi.stubEnv('GITHUB_REPOSITORY', undefined);
    expect(() => parseRepository()).toThrow('Input required: "repository" (GITHUB_REPOSITORY is not set either).');
  });

  it.each(['octo-org', 'octo-org/', '/repo', 'a/b/c', 'octo org/repo', 'octo-org/.', 'octo-org/..'])(
    'rejects %j and names the input',
    value => {
      vi.stubEnv('INPUT_SOURCE', value);
      expect(() => parseRepository('source')).toThrow(`Invalid input "source": "${value}" (expected "owner/repo").`);
    },
  );

  it('rejects an invalid repository of the workflow', () => {
    vi.stubEnv('INPUT_REPOSITORY', '');
    vi.stubEnv('GITHUB_REPOSITORY', 'invalid');
    expect(() => parseRepository()).toThrow('Invalid input "repository": "invalid" (expected "owner/repo").');
  });
});
