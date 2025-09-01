# Is Git Repository Root

📦
[**`@simbo/is-git-repository-root`**](https://npmjs.com/package/@simbo/is-git-repository-root)

A lightweight utility for checking whether a directory is the root of a Git
repository.

It simply checks for the presence of a `.git` folder in the given directory.

## Features

- Detects if a directory is the root of a Git repository

- Defaults to checking the **current working directory**

- Async and Promise-based API

- Fully typed with TypeScript

- Zero dependencies (besides other `@simbo/*` packages)

⚠️ Git submodules and worktrees are not considered repository roots.

## Installation

Install `@simbo/is-git-repository-root` from the npm registry:

```bash
npm i [-D] @simbo/is-git-repository-root
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_is-git-repository-root/).

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

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
