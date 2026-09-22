# @simbo/graceful-exit

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
- 2ded9ff: Update runtime dependencies: Yoctocolors to ^2.2.0, Zod to ^4.6.5,
  Globby to ^16.2.4, PQueue to ^9.3.3, YAML to ^2.9.1 and `type-fest` to ^5.10.0
  in the packages that use them.
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
  - @simbo/cli-output@2.0.0
  - @simbo/stringify-error@2.0.0
  - @simbo/user-facing-error@2.0.0

## 1.1.0

### Minor Changes

- 9844824: add `looseGracefulExit()` function

### Patch Changes

- 44fea53: fix package exports for `@simbo/cli-output`
- Updated dependencies [aeaa010]
- Updated dependencies [44fea53]
  - @simbo/stringify-error@1.0.2
  - @simbo/user-facing-error@1.0.2
  - @simbo/cli-output@1.0.1

## 1.0.2

### Patch Changes

- 6639b0f: link related packages in readme
- Updated dependencies [6639b0f]
  - @simbo/stringify-error@1.0.1
  - @simbo/user-facing-error@1.0.1

## 1.0.1

### Patch Changes

- 16222c2: fix typo in readme

## 1.0.0

### Major Changes

- 7142022: Initial Release

### Patch Changes

- Updated dependencies [8a93931]
- Updated dependencies [fcac612]
- Updated dependencies [85224d5]
  - @simbo/user-facing-error@1.0.0
  - @simbo/stringify-error@1.0.0
  - @simbo/cli-output@1.0.0
