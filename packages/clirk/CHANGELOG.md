# @simbo/clirk

## 2.0.0

### Major Changes

- 2ded9ff: Upgrade `normalize-package-data` to ^9.0.0 and `type-fest` to ^5.10.0
  for package metadata normalization and types.

  The normalization dependency now requires Node.js
  `^22.22.2 || ^24.15.0 || >=26.0.0`. This also affects Clirk through its
  dependency on `@simbo/find-up-package`. Upgrade to a supported Node.js runtime
  before updating.

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
- 2ded9ff: Check for own properties when adding built-in flag descriptions so
  inherited properties do not prevent default descriptions from being added.
- 2ded9ff: Update runtime dependencies: Yoctocolors to ^2.2.0, Zod to ^4.6.5,
  Globby to ^16.2.4, PQueue to ^9.3.3, YAML to ^2.9.1 and `type-fest` to ^5.10.0
  in the packages that use them.
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
  - @simbo/cli-output@2.0.0
  - @simbo/find-up-package@2.0.0
  - @simbo/graceful-exit@2.0.0
  - @simbo/plural@2.0.0
  - @simbo/stringify-error@2.0.0
  - @simbo/zodpak@1.0.0

## 1.1.4

### Patch Changes

- 39c0ab9: fix pnpm workspace dependencies
- Updated dependencies [39c0ab9]
  - @simbo/zodpak@0.1.4
  - @simbo/cli-output@1.0.1
  - @simbo/find-up-package@1.0.3
  - @simbo/graceful-exit@1.1.0
  - @simbo/plural@1.0.1
  - @simbo/stringify-error@1.0.2

## 1.1.3

### Patch Changes

- faa5cdc: upgrade dependencies and fix linting issues
- Updated dependencies [faa5cdc]
  - @simbo/zodpak@0.1.3
  - @simbo/cli-output@1.0.1
  - @simbo/find-up-package@1.0.3
  - @simbo/graceful-exit@1.1.0
  - @simbo/plural@1.0.1
  - @simbo/stringify-error@1.0.2

## 1.1.2

### Patch Changes

- 6457f71: upgrade dependencies
- Updated dependencies [6457f71]
  - @simbo/find-up-package@1.0.3
  - @simbo/zodpak@0.1.2
  - @simbo/cli-output@1.0.1
  - @simbo/graceful-exit@1.1.0
  - @simbo/plural@1.0.1
  - @simbo/stringify-error@1.0.2

## 1.1.1

### Patch Changes

- c999daf: upgrade dependencies
- Updated dependencies [c999daf]
  - @simbo/zodpak@0.1.1
  - @simbo/cli-output@1.0.1
  - @simbo/find-up-package@1.0.2
  - @simbo/graceful-exit@1.1.0
  - @simbo/plural@1.0.1
  - @simbo/stringify-error@1.0.2

## 1.1.0

### Minor Changes

- 65e941c: refactor and use zod for validation

### Patch Changes

- 44fea53: fix package exports for `@simbo/cli-output`
- 7cd61a5: fix `import.meta` handling and provide import path in context
- Updated dependencies [d10c598]
- Updated dependencies [44fea53]
- Updated dependencies [aeaa010]
- Updated dependencies [44fea53]
- Updated dependencies [9844824]
  - @simbo/zodpak@0.1.0
  - @simbo/graceful-exit@1.1.0
  - @simbo/find-up-package@1.0.2
  - @simbo/plural@1.0.1
  - @simbo/stringify-error@1.0.2
  - @simbo/cli-output@1.0.1

## 1.0.1

### Patch Changes

- 6639b0f: update readme and link related packages
- Updated dependencies [6639b0f]
  - @simbo/graceful-exit@1.0.2
  - @simbo/stringify-error@1.0.1
  - @simbo/find-up-package@1.0.1

## 1.0.0

### Major Changes

- 70f4a5a: Initial Release
