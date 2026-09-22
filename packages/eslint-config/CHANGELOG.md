# @simbo/eslint-config

## 3.0.0

### Major Changes

- 2ded9ff: Require ESLint 10.4 or newer within v10 and Node.js ^22.22.2 ||
  ^24.15.0 || >=26.0.0. Upgrade the ESLint, Unicorn, JSDoc, Node.js and globals
  presets. Existing configuration exports remain unchanged, but updated rules
  can report new errors.

  Use ESLint's built-in configuration helpers, remove the duplicate JavaScript
  JSDoc preset and obsolete test-rule comments, and preserve the existing JSDoc,
  export and TypeScript naming conventions through explicit Unicorn overrides.
  Do not require Temporal or RegExp.escape in projects targeting older runtimes.

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

## 2.0.4

### Patch Changes

- 39c0ab9: fix pnpm workspace dependencies

## 2.0.3

### Patch Changes

- faa5cdc: upgrade dependencies

## 2.0.2

### Patch Changes

- adedf36: upgrade dependencies

## 2.0.1

### Patch Changes

- 00ef56b: publish version 2.0.1 as a version 2.0.0 has already been published
  in the past due to a mistake and been yanked.

## 2.0.0

### Major Changes

- 6457f71: remove re-exports of `defineConfig()` and `globalIgnores()`

### Patch Changes

- 6457f71: upgrade dependencies

## 1.1.1

### Patch Changes

- ad6370a: fix jsdoc config for vue files

## 1.1.0

### Minor Changes

- d63b895: re-export parser from typescript-eslint

## 1.0.4

### Patch Changes

- c999daf: upgrade dependencies

## 1.0.3

### Patch Changes

- f1bc146: fix selector settings for `@typescript-eslint/naming-convention`

## 1.0.2

### Patch Changes

- c7d7a92: fix eslint config for mocks

## 1.0.1

### Patch Changes

- 0dac1be: add tests
- fccad6c: fix type imports

## 1.0.0

### Major Changes

- c0445b5: Initial Release
