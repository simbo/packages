# Git Fixture

📦 [**`@simbo/git-fixture`**](https://npmjs.com/package/@simbo/git-fixture)

Create temporary Git repositories with a neutral configuration for tests.

Built on [`@simbo/git-exec`](https://npmjs.com/package/@simbo/git-exec), for
tests that run real Git instead of mocking it, with any test runner.

## Features

- `createGitFixture()` creates a repository in a new temporary directory,
  optionally with an initial commit

- `cloneGitFixture()` clones a repository into a new temporary directory

- Helpers to run Git, write files, and commit in the repository

- A neutral configuration, so that results do not depend on the host: global and
  system configurations are ignored, Git does not search above the temporary
  directory, signing is off, and author, committer, and dates are fixed, which
  makes commit hashes reproducible

- Paths with symbolic links resolved, such as `/private/var` instead of `/var`
  on macOS

- Cleanup with `cleanup()` or `await using`

## Requirements

Requires Node.js `^24.15.0 || >=26.0.0` and Git 2.28 or newer on the `PATH`. The
tests run on macOS and Linux.

## Installation

Install `@simbo/git-fixture` from the npm registry as a development dependency:

```bash
npm i -D @simbo/git-fixture
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.de/packages/modules/_simbo_git-fixture/).

```ts
import { cloneGitFixture, createGitFixture } from '@simbo/git-fixture';

it('reads the latest commit', async () => {
  await using repo = await createGitFixture({
    files: { 'README.md': '# Test\n', 'src/index.ts': 'export {};\n' },
  });

  await repo.write('src/index.ts', 'export const answer = 42;\n');
  const hash = await repo.commit('add answer', { 'CHANGELOG.md': '# 1.0.0\n' });

  await using clone = await cloneGitFixture(repo.dir, {
    args: ['--depth', '1'],
  });

  expect(await clone.git(['rev-parse', 'HEAD'])).toBe(hash);
}); // both directories are removed here
```

Without `await using`, remove the repository with `cleanup()`, for example in
`afterEach()`.

### The Code Under Test

The fixture runs its own Git commands with the neutral configuration. Code under
test that runs Git itself reads the environment of the process instead. Set the
variables of `env` for it, for example with Vitest, and restore the environment
after each test:

```ts
let repo: GitFixture;

beforeEach(async () => {
  repo = await createGitFixture({ files: { 'a.txt': 'a\n' } });
  for (const [name, value] of Object.entries(repo.env)) {
    vi.stubEnv(name, value);
  }
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await repo.cleanup();
});
```

The variables then apply to all code in the test process, also to Git commands
outside the repository, until `vi.unstubAllEnvs()` restores them.

`env` holds `GIT_CONFIG_GLOBAL` (the null device), `GIT_CONFIG_NOSYSTEM`,
`GIT_CEILING_DIRECTORIES` (the parent of the repository), `GIT_TERMINAL_PROMPT`,
and name, email, and date of author and committer. Signing is turned off with
`-c` options for the commands of the fixture only.

### Options

Both functions accept these options:

| Option   | Description                                                               | Default                  |
| -------- | ------------------------------------------------------------------------- | ------------------------ |
| `prefix` | The prefix of the temporary directory name.                               | `'git-fixture-'`         |
| `date`   | The author and committer date of all commits, as `Date` or `string`.      | `'2000-01-01T00:00:00Z'` |
| `debug`  | A callback that receives every Git command of the fixture before it runs. | none                     |

`createGitFixture()` also accepts:

| Option          | Description                                                   | Default     |
| --------------- | ------------------------------------------------------------- | ----------- |
| `initialBranch` | The name of the initial branch.                               | `'main'`    |
| `files`         | Files of an initial commit; without them, there is no commit. | none        |
| `message`       | The message of the initial commit.                            | `'initial'` |

`cloneGitFixture(source, options)` also accepts `args`, additional arguments for
`git clone` that are passed before the source.

### The Fixture

| Member                   | Description                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `dir`                    | The absolute path of the repository.                                                                       |
| `env`                    | The environment variables of the neutral configuration.                                                    |
| `git(args)`              | Runs Git in the repository and returns the trimmed standard output.                                        |
| `gitSucceeds(args)`      | Runs Git in the repository and reports whether it exited with code 0.                                      |
| `path(...segments)`      | Resolves a path in the repository.                                                                         |
| `write(path, contents)`  | Writes a file without staging it; paths outside the repository, also through symbolic links, are rejected. |
| `writeFiles(files)`      | Writes several files without staging them.                                                                 |
| `commit(message, files)` | Writes the files, stages all changes, commits, and returns the commit hash.                                |
| `cleanup()`              | Removes the repository directory.                                                                          |

Failed Git commands reject with a `GitError` of `@simbo/git-exec`. If
`createGitFixture()` or `cloneGitFixture()` fails, the temporary directory is
removed.

## Security

Git runs through `@simbo/git-exec` without a shell. Git itself, however, runs
commands that some options name, such as `--upload-pack` for `clone`.
`@simbo/git-fixture` passes the arguments of `git()`, `gitSucceeds()`, and
`cloneGitFixture()` to Git as given and does not filter them.

The package is meant for tests with values from the test itself. Never pass
untrusted values as options; place them after `--end-of-options` or `--`, as
described in the
[security notes of `@simbo/git-exec`](https://github.com/simbo/packages/tree/main/packages/git-exec#security).

## License

[MIT © Simon Lepel](https://simbo.mit-license.org/2026/)
