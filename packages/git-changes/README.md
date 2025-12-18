# Git Changes

📦 [**`@simbo/git-changes`**](https://npmjs.com/package/@simbo/git-changes)

A library to read, parse and provide Git changes information for a local
repository.

## Installation

Install `@simbo/git-changes` from the npm registry:

```bash
npm i [-D] @simbo/git-changes
```

## Usage

```ts
import { getGitChanges } from '@simbo/git-changes';

// get a map of changed files in the repository located at /path/to/repo
const changes = await getGitChanges('/path/to/repo');
```

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_git-changes/).

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
