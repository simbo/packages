# @simbo/rollup-github-actions-config

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
- 2ded9ff: Upgrade the Rollup configuration to `@rollup/plugin-terser` ^1.0.0
  and `@rollup/plugin-commonjs` ^29.0.3.

## 1.0.2

### Patch Changes

- a7ed93e: ignore warning about circular dependencies in `@actions/core`

## 1.0.1

### Patch Changes

- 39c0ab9: fix pnpm workspace dependencies

## 1.0.0

### Major Changes

- 0ab1038: Initial release
