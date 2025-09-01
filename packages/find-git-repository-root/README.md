# Find Git Repository Root

📦
[**`@simbo/find-git-repository-root`**](https://npmjs.com/package/@simbo/find-git-repository-root)

A lightweight utility for locating the **root directory of a Git repository**.

It searches upward from a given directory until it finds a valid repository root
(a directory containing a `.git `folder).

This package builds on [find-up](https://npmjs.com/package/find-up) and
[`@simbo/is-git-repository-root`](https://npmjs.com/package/@simbo/is-git-repository-root).

## Features

- Detects the **root directory** of a Git repository

- Returns the absolute path to the Git repository root

- Uses upward search from a given working directory (defaults to
  `process.cwd()`)

- Async and Promise-based API

- Fully typed with TypeScript

## Installation

Install `@simbo/find-git-repository-root` from the npm registry:

```bash
npm i [-D] @simbo/find-git-repository-root
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_find-git-repository-root/).

### Example

```ts
import { findGitRepositoryRoot } from '@simbo/find-git-repository-root';

// Default: start from current working directory
const root = await findGitRepositoryRoot();

// Or specify a starting directory
const rootFromPath = await findGitRepositoryRoot('/path/to/subdir');
```

If no Git repository root is found, the function resolves to `undefined`.

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
