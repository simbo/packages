# @simbo/monorepo-utils

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
  - @simbo/package-json@2.0.0
  - @simbo/stringify-error@3.0.0

## 2.0.3

### Patch Changes

- 2bf4f7d: Read the title of a workspace README as plain text.

  - `title` of the workspace metadata drops images and HTML tags, keeps only the
    text of links, and removes emphasis, strong emphasis, strikethrough, inline
    code, and a closing sequence of `#`. Escaped characters stay as they are
    written, and whitespace is collapsed.

  - A README whose H1 holds no text, such as one of images only, fails like a
    README without an H1.

## 2.0.2

### Patch Changes

- 6f304e0: Include the original sources in source maps (`inlineSources`), so
  debuggers and stack traces show the TypeScript code without publishing `src`.
- 3982c1d: Update `p-queue` to ^10.0.0 and adapt to its queue behavior.

  - `getPackagePathByName()` no longer fails with `failOnError` after finding
    the package.
  - `readWorkspaces()` reports only the workspaces that failed.
  - Both functions reject a `concurrency` that is not a positive integer or
    `Infinity` with a `TypeError`.

- Updated dependencies [6f304e0]
  - @simbo/accessible@2.0.1
  - @simbo/package-json@1.0.1
  - @simbo/stringify-error@2.0.1

## 2.0.1

### Patch Changes

- e235985: Update `p-queue` to ^9.3.5.
- @simbo/accessible@2.0.0
  - @simbo/package-json@1.0.0
  - @simbo/stringify-error@2.0.0

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
- 2ded9ff: Preserve the original error as `cause` when wrapping read or command
  failures.
- 2ded9ff: Update runtime dependencies: Yoctocolors to ^2.2.0, Zod to ^4.6.5,
  Globby to ^16.2.4, PQueue to ^9.3.3, YAML to ^2.9.1 and `type-fest` to ^5.10.0
  in the packages that use them.
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
  - @simbo/accessible@2.0.0
  - @simbo/package-json@1.0.0
  - @simbo/stringify-error@2.0.0

## 1.0.6

### Patch Changes

- 39c0ab9: fix pnpm workspace dependencies
  - @simbo/accessible@1.0.1
  - @simbo/package-json@0.1.3
  - @simbo/stringify-error@1.0.2

## 1.0.5

### Patch Changes

- faa5cdc: upgrade dependencies
  - @simbo/accessible@1.0.1
  - @simbo/package-json@0.1.3
  - @simbo/stringify-error@1.0.2

## 1.0.4

### Patch Changes

- 033b8b5: add `getPackagePathByName`

## 1.0.3

### Patch Changes

- 6457f71: upgrade dependencies
- Updated dependencies [6457f71]
  - @simbo/package-json@0.1.3
  - @simbo/accessible@1.0.1
  - @simbo/stringify-error@1.0.2

## 1.0.2

### Patch Changes

- db186da: update readme regarding related packages
- Updated dependencies [aeaa010]
  - @simbo/accessible@1.0.1
  - @simbo/package-json@0.1.2
  - @simbo/stringify-error@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [6639b0f]
  - @simbo/stringify-error@1.0.1
  - @simbo/package-json@0.1.1

## 1.0.0

### Major Changes

- 2ec260c: Initial Release
