# Find Git Repository Root

📦
[**`@simbo/find-git-repository-root`**](https://npmjs.com/package/@simbo/find-git-repository-root)

A lightweight utility for locating the **root directory of a Git working tree**,
including linked worktrees and submodules.

It asks Git for the top-level directory with `git rev-parse --show-toplevel`.

## Features

- Detects the **root directory** of a Git working tree, including linked
  worktrees and submodules

- Returns the canonical absolute path, with symbolic links resolved

- Starts from a given working directory (defaults to `process.cwd()`)

- Async and Promise-based API

- Fully typed with TypeScript

## Requirements

Requires Node.js `^24.15.0 || >=26.0.0` and Git on the `PATH`.

## Installation

Install `@simbo/find-git-repository-root` from the npm registry:

```bash
npm i [-D] @simbo/find-git-repository-root
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.de/packages/modules/_simbo_find-git-repository-root/).

### Example

```ts
import { findGitRepositoryRoot } from '@simbo/find-git-repository-root';

// Default: start from current working directory
const root = await findGitRepositoryRoot();

// Or specify a starting directory
const rootFromPath = await findGitRepositoryRoot('/path/to/subdir');
```

### Behavior

| Directory                                       | Result                 |
| ----------------------------------------------- | ---------------------- |
| Inside a repository                             | root of the repository |
| Inside a linked worktree                        | root of the worktree   |
| Inside a submodule                              | root of the submodule  |
| Bare repository or `.git` directory             | `undefined`            |
| Outside a repository, even with a `.git` folder | `undefined`            |
| Missing path or file                            | `undefined`            |
| Git cannot be started                           | rejects (`GitError`)   |

## License

[MIT © Simon Lepel](https://simbo.mit-license.org/2025/)
