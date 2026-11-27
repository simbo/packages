# Git Exec

📦 [**`@simbo/git-exec`**](https://npmjs.com/package/@simbo/git-exec)

Run Git commands asynchronously and get their output as text, buffer, or success
flag.

Built on `execFile` from `node:child_process`, without a shell, for GitHub
Actions, command line tools, and libraries.

## Features

- `git()` returns the standard output as trimmed text

- `gitBuffer()` returns the raw standard output, for binary data

- `gitSucceeds()` reports whether a command exited with code 0

- Failures reject with a `GitError` that holds the arguments, the exit code, and
  the standard error output

- A `debug` callback receives the commands, for example `core.debug` from
  `@actions/core`

- Zero dependencies

## Requirements

Requires Node.js `^24.15.0 || >=26.0.0` and Git on the `PATH`.

## Installation

Install `@simbo/git-exec` from the npm registry:

```bash
npm i @simbo/git-exec
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.de/packages/modules/_simbo_git-exec/).

```ts
import { git, gitBuffer, GitError, gitSucceeds } from '@simbo/git-exec';

const root = await git(['rev-parse', '--show-toplevel'], {
  cwd: '/path/to/repo',
});

const blob = await gitBuffer(['cat-file', 'blob', 'HEAD:image.png'], {
  cwd: root,
});

if (await gitSucceeds(['cat-file', '-e', 'HEAD:README.md'], { cwd: root })) {
  // README.md exists in HEAD
}

try {
  await git(['switch', 'missing-branch'], { cwd: root });
} catch (error) {
  if (error instanceof GitError) {
    console.error(error.exitCode, error.stderr);
  }
}
```

### Options

| Option      | Description                                                                       | Default         |
| ----------- | --------------------------------------------------------------------------------- | --------------- |
| `cwd`       | The working directory of the command.                                             | `process.cwd()` |
| `env`       | Variables merged over `process.env`; `undefined` removes a variable.              | none            |
| `maxBuffer` | The largest output in bytes on standard output or standard error.                 | 1 GiB           |
| `debug`     | A callback for the command before it runs and the reason a `gitSucceeds()` fails. | none            |

### Errors

`git()` and `gitBuffer()` reject with a `GitError` if Git cannot be started,
exits with a non-zero code, is terminated, or exceeds `maxBuffer`. The message
contains the command, the reason, and the standard error output.

`gitSucceeds()` returns `false` only for a non-zero exit code. If Git cannot run
at all, it rejects, so that a missing Git or working directory is not mistaken
for a failed check.

In GitHub Actions, pass `core.debug` to see the commands in debug logs:

```ts
import { debug } from '@actions/core';
import { git } from '@simbo/git-exec';

const head = await git(['rev-parse', 'HEAD'], { debug });
```

## Security

Git runs through `execFile` without a shell, so no shell interprets the
arguments. Git itself, however, runs commands that some options name, such as
`--upload-pack` for `clone`, `fetch`, and `ls-remote`, or `-c` with
`core.sshCommand`. `@simbo/git-exec` passes all arguments to Git as given and
does not filter them.

Never pass untrusted values, such as user input or data from a pull request, as
options. Place them where Git cannot read them as options:

- after `--end-of-options` for revisions, branches, tags, and remotes
- after `--` for paths, with the `:(literal)` prefix to turn off pathspec magic

```ts
// `ref` and `path` come from untrusted input
await git([
  'log',
  '--oneline',
  '--end-of-options',
  ref,
  '--',
  `:(literal)${path}`,
]);
```

## License

[MIT © Simon Lepel](https://simbo.mit-license.org/2025/)
