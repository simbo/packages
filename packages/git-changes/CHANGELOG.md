# @simbo/git-changes

## 3.0.0

### Major Changes

- 97bc732: Fix and extend how Git changes are read and parsed.

  - Renamed and copied files are now reported with the new path as `path` and
    the original path as `originPath`. Previously, both paths were swapped.
  - Untracked directories are now reported as individual files instead of a
    single `dir/` entry, also when `status.showUntrackedFiles` is configured
    otherwise.
  - Add `GitChangeStatus.TypeChanged` (`T`) for files whose type changed, such
    as a file replaced by a symlink. These files were previously missing.
  - Add `GitChangeStatus.Unmerged` (`U`) for files with merge conflicts. Both
    `staged` and `unstaged` are set to `Unmerged`. These files were previously
    missing, and files added or deleted on both sides were reported as `Added`
    or `Deleted`.

  To migrate, remove workarounds that swap `path` and `originPath` or expand
  untracked directories, and handle the new statuses where you check all status
  values.

## 2.1.2

### Patch Changes

- e235985: Update `execa` to ^10.2.0.
- @simbo/find-git-repository-root@2.0.0

## 2.1.1

### Patch Changes

- 48389a9: Parse Git status characters into enum members without unsafe type
  assertions and allow the added status in the unstaged type to match existing
  parser behavior.
- @simbo/find-git-repository-root@2.0.0

## 2.1.0

### Minor Changes

- 50850c2: simplify types for git changes

## 2.0.0

### Major Changes

- 2ded9ff: Upgrade Execa to ^10.0.1 for running Prettier, locating executables
  and reading Git changes.

  Execa 10 requires Node.js 22 or newer, dropping Node.js 20 support for these
  packages. Upgrade the runtime before updating.

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
- 2ded9ff: Preserve the original error as `cause` when wrapping read or command
  failures.
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
  - @simbo/find-git-repository-root@2.0.0

## 1.0.3

### Patch Changes

- fcd0224: improve types to reflect staged and unstaged states

## 1.0.2

### Patch Changes

- 5d6bd64: improve types to reflect staged and unstaged states

## 1.0.1

### Patch Changes

- 108eaaf: fix pnpm workspace dependencies

## 1.0.0

### Major Changes

- 0ab1038: Initial release
