# @simbos-packages/changelog

## 1.4.3

### Patch Changes

- c999daf: combine dependency catalogs to the default catalog

## 1.4.2

### Patch Changes

- 3e6b3eb: automatically generate markdown list of packages
- 51cdb8a: improve vscode performance by setting `search.followSymlinks` to
  false
- ba94173: let docs build fail on warnings

## 1.4.1

### Patch Changes

- 8940463: precede docs build by global build and improve success message for
  preflight script

## 1.4.0

### Minor Changes

- 40384c9: setup turbo tasks for eslint and prettier
- 4bbebf1: setup prettier for all workspaces

### Patch Changes

- 62e9cbf: add `CHANGELOG.md` referring to the actual changelogs and update the
  readme

## 1.3.1

### Patch Changes

- 8009a80: fix var usage in docs workflow

## 1.3.0

### Minor Changes

- a221cdc: setup eslint for all packages

### Patch Changes

- db57144: enable unit tests in checks workflow
- deba441: add vitest configs to all workspaces

## 1.2.0

### Minor Changes

- 6378850: Added Docs Publishing and updated README files.

## 1.1.0

### Minor Changes

- 6c8d2c8: Repo setup changes:
  - rename repo from `simbos-configs` to `packages`
  - add vitest setup
  - set some pnpm options
  - create pnpm catalog entries for all dependencies
  - set typedoc router settings to 'kind-dir'
  - improve folder structure of `src` folders for all packages
  - remove deprecated `npm-check-updates` scripts from root package.json

## 1.0.0

### Major Changes

- fb86c78: Initial Release
