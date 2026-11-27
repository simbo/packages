# @simbo/find-git-repository-root

## 4.0.1

### Patch Changes

- Updated dependencies [c017ffe]
  - @simbo/git-exec@1.0.2

## 4.0.0

### Major Changes

- bf3749b: Find the root of a Git working tree with
  `git rev-parse --show-toplevel` instead of searching upward for a `.git`
  directory.

  - Inside a linked worktree or a submodule, the root of the worktree or
    submodule is returned instead of the root of an enclosing repository.
  - The returned path is canonical: Git resolves symbolic links, so on macOS a
    temporary directory is returned as `/private/var/…`.
  - Bare repositories, the `.git` directory, directories outside a repository,
    missing paths and files resolve to `undefined`, even if a parent directory
    is a repository.
  - The function rejects with a `GitError` from `@simbo/git-exec` if Git cannot
    be started or is terminated.
  - Replace the dependencies on `find-up` and `@simbo/is-git-repository-root`
    with `@simbo/git-exec` and `@simbo/accessible`.

  Version 3.0.1 already returned the roots of worktrees and submodules and
  rejected without Git through `@simbo/is-git-repository-root` 4.0.0; this
  release makes that the contract of this package.

  Git must be installed and on the `PATH`. Compare returned paths with
  `realpath()` results instead of the given path, handle `undefined` for missing
  directories, and catch the `GitError` where Git may be missing.

## 3.0.1

### Patch Changes

- Updated dependencies [9410189]
  - @simbo/is-git-repository-root@4.0.0

## 3.0.0

### Major Changes

- 19c8dc1: Require Node.js ^24.15.0 || >=26.0.0 across all packages, as Node.js
  22 reaches its end of life on 2027-04-30.

  - Remove `^22.22.2` from `engines.node` in every package.
  - Update the requirements in the package READMEs.

  Node.js 22 is no longer supported. Upgrade to Node.js ^24.15.0 or >=26.0.0
  before updating these packages.

### Patch Changes

- 19c8dc1: Point the `repository` field of the manifest to the workspace folder.

  - `repository` uses the object form with `type`, `url`, and `directory`, so
    npm links the package folder and resolves relative links in the README from
    there.
  - `packages-changelog` gets the field for the first time.

- Updated dependencies [19c8dc1]
- Updated dependencies [19c8dc1]
  - @simbo/is-git-repository-root@3.0.0

## 2.0.1

### Patch Changes

- 6f304e0: Include the original sources in source maps (`inlineSources`), so
  debuggers and stack traces show the TypeScript code without publishing `src`.
- Updated dependencies [6f304e0]
  - @simbo/is-git-repository-root@2.0.1

## 2.0.0

### Major Changes

- 2ded9ff: Require Node.js ^22.22.2 || ^24.15.0 || >=26.0.0 across all packages
  to align with the runtime requirements of the updated dependencies. Node.js
  20, 21, 23 and 25, as well as earlier Node.js 22 and 24 releases, are no
  longer supported. Upgrade to a supported Node.js version before updating these
  packages.

### Patch Changes

- 2ded9ff: Update documentation links from `simbo.codes` to `simbo.de`,
  including the package READMEs and generated package list.
- 2ded9ff: Document the shared Node.js requirements and updated peer
  dependencies. Correct API documentation links, installation and usage
  examples, and repository development instructions. Clarify string count
  conversion, literal replacements and import metadata fallbacks.
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
  - @simbo/is-git-repository-root@2.0.0

## 1.0.2

### Patch Changes

- 6457f71: upgrade dependencies
  - @simbo/is-git-repository-root@1.0.1

## 1.0.1

### Patch Changes

- aeaa010: update readme
- Updated dependencies [aeaa010]
  - @simbo/is-git-repository-root@1.0.1

## 1.0.0

### Major Changes

- d1e7d92: Initial Release

### Patch Changes

- Updated dependencies [5092b1b]
  - @simbo/is-git-repository-root@1.0.0
