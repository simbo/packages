import lint from '@commitlint/lint';
import load from '@commitlint/load';
import { describe, expect, it } from 'vitest';

import commitlintConfig from '../src/index.js';

describe('commitlint config', () => {
  it('accepts a valid commit message', async () => {
    const config = await load(commitlintConfig);
    const result = await lint('feat(test): some changes', config.rules);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects an invalid commit message', async () => {
    const config = await load(commitlintConfig);
    const result = await lint('some changes', config.rules);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('ignores commit messages starting with "Merge"', async () => {
    const config = await load(commitlintConfig);
    const result = await lint('Merge pull request #123 from feature/some-feature', config.rules);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('ignores commit messages starting with "Revert"', async () => {
    const config = await load(commitlintConfig);
    const result = await lint('Revert "some changes"', config.rules);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('exports a ignore list of functions that test strings', () => {
    const ignores = commitlintConfig.ignores;
    expect(ignores).toBeDefined();
    expect(Array.isArray(ignores)).toBe(true);
    expect(ignores?.length).toBeGreaterThan(0);

    if (ignores != null) {
      for (const ignore of ignores) {
        expect(typeof ignore('foo')).toBe('boolean');
      }
    }
  });
});
