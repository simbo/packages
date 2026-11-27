# Is Git Repository Root

📦
[**`@simbo/is-git-repository-root`**](https://npmjs.com/package/@simbo/is-git-repository-root)

A lightweight utility for checking whether a directory is the root of a Git
working tree, including linked worktrees and submodules.

It asks Git for the top-level directory with `git rev-parse --show-toplevel` and
compares it with the given directory after resolving symbolic links in both
paths.

## Features

- Detects if a directory is the root of a Git working tree, including linked
  worktrees and submodules

- Defaults to checking the **current working directory**

- Async and Promise-based API

- Fully typed with TypeScript

- Zero dependencies (besides other `@simbo/*` packages)

## Requirements

Requires Node.js `^24.15.0 || >=26.0.0` and Git on the `PATH`.

## Installation

Install `@simbo/is-git-repository-root` from the npm registry:

```bash
npm i [-D] @simbo/is-git-repository-root
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.de/packages/modules/_simbo_is-git-repository-root/).

### Example

```ts
import { isGitRepositoryRoot } from '@simbo/is-git-repository-root';

if (await isGitRepositoryRoot()) {
  console.log('This is a Git repository root.');
}

if (await isGitRepositoryRoot('/path/to/dir')) {
  console.log('That directory is a Git repository root.');
}
```

### Behavior

| Directory                                       | Result               |
| ----------------------------------------------- | -------------------- |
| Root of a repository, worktree or submodule     | `true`               |
| Symbolic link to such a root                    | `true`               |
| Subdirectory of a working tree                  | `false`              |
| Bare repository or `.git` directory             | `false`              |
| Outside a repository, even with a `.git` folder | `false`              |
| Missing path or file                            | `false`              |
| Git cannot be started                           | rejects (`GitError`) |

## License

[MIT © Simon Lepel](https://simbo.mit-license.org/2025/)
