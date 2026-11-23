# Git Changes

📦 [**`@simbo/git-changes`**](https://npmjs.com/package/@simbo/git-changes)

A library to read, parse and provide Git changes information for a local
repository.

## Requirements

Requires Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`.

## Installation

Install `@simbo/git-changes` from the npm registry:

```bash
npm i [-D] @simbo/git-changes
```

## Usage

```ts
import { getGitChanges, GitChangeStatus } from '@simbo/git-changes';

// get a map of changed files in the repository located at /path/to/repo
const changes = await getGitChanges('/path/to/repo');

for (const change of changes.values()) {
  if (change.staged === GitChangeStatus.Renamed) {
    console.log(`${change.originPath} → ${change.path}`);
  }
}
```

`getGitChanges()` accepts any directory inside the repository and defaults to
the current working directory. It reads `git status --porcelain --null` and
returns a `ReadonlyMap` from file path to change. Example:

```ts
Map {
  'new.txt' => { path: 'new.txt', originPath: 'old.txt', staged: 'R', unstaged: undefined },
  'src/index.ts' => { path: 'src/index.ts', staged: 'M', unstaged: 'M' },
  'docs/draft.md' => { path: 'docs/draft.md', staged: undefined, unstaged: '?' },
}
```

### Changes

Each change has these properties:

| Property     | Description                                                                 |
| ------------ | --------------------------------------------------------------------------- |
| `path`       | File path relative to the repository root; the new path for renames/copies. |
| `originPath` | Original path relative to the repository root; only for renames/copies.     |
| `staged`     | Status in the index, or `undefined` if the file has no staged change.       |
| `unstaged`   | Status in the working tree, or `undefined` if it has no unstaged change.    |

### Statuses

| `GitChangeStatus` | Value | Meaning                                        |
| ----------------- | ----- | ---------------------------------------------- |
| `Added`           | `A`   | File was added.                                |
| `Modified`        | `M`   | File was modified.                             |
| `TypeChanged`     | `T`   | File type changed, such as file to symlink.    |
| `Deleted`         | `D`   | File was deleted.                              |
| `Renamed`         | `R`   | File was renamed; see `originPath`.            |
| `Copied`          | `C`   | File was copied; see `originPath`.             |
| `Unmerged`        | `U`   | File has merge conflicts; set for both fields. |
| `Untracked`       | `?`   | File is not tracked; only set for `unstaged`.  |

### Notes

- Untracked directories are listed as individual files, regardless of the
  `status.showUntrackedFiles` Git configuration. Ignored files are not listed.
- Copies are only detected if Git is configured to detect them
  (`status.renames=copies`).
- Files with merge conflicts (for example both modified or both added) have
  `staged` and `unstaged` set to `Unmerged`.
- The lower-level helpers `parseGitStatusOutput()` and `parseGitChangeStatus()`
  are exported to parse existing `git status --porcelain --null` output.

For a complete API reference, see the
[documentation](https://simbo.de/packages/modules/_simbo_git-changes/).

## License

[MIT © Simon Lepel](https://simbo.mit-license.org/2025/)
