# Git Constants

📦 [**`@simbo/git-constants`**](https://npmjs.com/package/@simbo/git-constants)

A small collection of Git-related constants that can be reused across Node.js
and TypeScript projects.

Useful for working with Git references, branches, tags, and commit identifiers
in a consistent way.

## Features

- Predefined constants for common Git concepts

- Covers `.git` folder name, reference prefixes (`refs/`, `refs/heads/`,
  `refs/remotes/`, `refs/tags/`, `refs/pulls/`), and `/merge` suffix

- Default branch name (`main`)

- Short SHA length (`7`) for commit references

- Fully typed with TypeScript

- Zero dependencies

## Installation

Install `@simbo/git-constants` from the npm registry:

```bash
npm i [-D] @simbo/git-constants
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_git-constants/).

```ts
import {
  GIT_DEFAULT_BRANCH,
  GIT_FOLDER,
  GIT_REFS_PREFIX,
  GIT_REFS_HEADS_PREFIX,
  GIT_SHA_SHORT_LENGTH,
} from '@simbo/git-constants';

console.log(GIT_DEFAULT_BRANCH); // "main"
console.log(GIT_FOLDER); // ".git"
console.log(GIT_REFS_PREFIX); // "refs/"
console.log(GIT_REFS_HEADS_PREFIX); // "refs/heads/"
console.log(GIT_SHA_SHORT_LENGTH); // 7
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
