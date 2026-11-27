# @simbo/git-fixture

## 1.0.1

### Patch Changes

- fa8d241: Document how to set and restore the environment for the code under
  test.

  - The README shows `vi.stubEnv()` in `beforeEach()` and `vi.unstubAllEnvs()`
    with `cleanup()` in `afterEach()`.
  - It notes that the variables apply to the whole test process until they are
    restored.

## 1.0.0

### Major Changes

- a68ec52: Add `@simbo/git-fixture` to create temporary Git repositories with a
  neutral configuration for tests.

  - `createGitFixture()` creates a repository in a new temporary directory,
    optionally with an initial commit, and `cloneGitFixture()` clones one.
  - The fixture runs Git, writes files, commits, and removes itself with
    `cleanup()` or `await using`.
  - Global and system configurations are ignored, Git does not search above the
    temporary directory, signing is off, and author, committer, and dates are
    fixed, so commit hashes are reproducible.
  - `env` holds the variables of that configuration for the code under test.
