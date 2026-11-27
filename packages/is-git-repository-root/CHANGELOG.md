# @simbo/is-git-repository-root

## 4.0.1

### Patch Changes

- Updated dependencies [c017ffe]
  - @simbo/git-exec@1.0.2

## 4.0.0

### Major Changes

- 9410189: Detect the root of a Git working tree with
  `git rev-parse --show-toplevel` instead of looking for a `.git` directory.

  - The roots of linked worktrees and submodules, where `.git` is a file, are
    detected as roots.
  - The given directory and the top-level directory are compared after resolving
    symbolic links.
  - Bare repositories, the `.git` directory, subdirectories, missing paths and
    files still return `false`.
  - A directory outside a Git repository returns `false`, even if it contains a
    `.git` directory.
  - The function rejects with a `GitError` from `@simbo/git-exec` if Git cannot
    be started or is terminated.
  - Replace the dependency on `@simbo/git-constants` with `@simbo/git-exec`.

  Git must be installed and on the `PATH`. Code that relied on `false` for
  worktree and submodule roots, on `true` for a `.git` directory outside a
  repository, or on the function never rejecting must be adapted; catch the
  `GitError` where Git may be missing.

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
  - @simbo/accessible@3.0.0
  - @simbo/git-constants@3.0.0

## 2.0.1

### Patch Changes

- 6f304e0: Include the original sources in source maps (`inlineSources`), so
  debuggers and stack traces show the TypeScript code without publishing `src`.
- Updated dependencies [6f304e0]
  - @simbo/accessible@2.0.1
  - @simbo/git-constants@2.0.1

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
  - @simbo/accessible@2.0.0
  - @simbo/git-constants@2.0.0

## 1.0.1

### Patch Changes

- aeaa010: update readme
- Updated dependencies [aeaa010]
  - @simbo/accessible@1.0.1
  - @simbo/git-constants@1.0.1

## 1.0.0

### Major Changes

- 5092b1b: Initial Release

### Patch Changes

- Updated dependencies [cc73cb0]
- Updated dependencies [cc9dd53]
  - @simbo/git-constants@1.0.0
  - @simbo/accessible@1.0.0
