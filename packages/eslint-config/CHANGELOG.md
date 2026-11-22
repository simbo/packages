# @simbo/eslint-config

## 3.3.0

### Minor Changes

- 972435c: Base the Unicorn configurations on the `recommended` preset instead
  of `all`.

  - Rules that only `all` enables are no longer active: `comment-content`,
    `consistent-destructuring`, `consistent-function-style`,
    `custom-error-definition`, `id-match`, `iteration-fallback-style`,
    `no-array-front-mutation`, `no-invalid-file-input-accept`,
    `no-keyword-prefix`, `no-manually-wrapped-comments`,
    `no-missing-local-resource`, `no-repeated-call-wrappers`,
    `no-unnecessary-default-arguments`, `no-unreadable-new-expression`,
    `no-unsafe-dom-html`, `no-unused-properties`, `prefer-dispose`,
    `prefer-import-meta-properties`, `prefer-iterator-concat`,
    `prefer-json-import`, `prefer-short-arrow-method`, `prefer-uint8array-hex`,
    `require-post-message-target-origin` and `string-content`.
  - Remove the overrides that only disabled rules `recommended` already leaves
    off.
  - Update `eslint-plugin-unicorn` to ^79.0.0.

  Updated Unicorn rules can report new errors. Enable any of the rules above in
  your own configuration to keep using them.

### Patch Changes

- 6f304e0: Include the original sources in source maps (`inlineSources`), so
  debuggers and stack traces show the TypeScript code without publishing `src`.
- 492ac88: Update dependencies.

  - `eslint-plugin-jsdoc` to ^65.4.5
  - `globals` to ^17.14.0
  - `typescript-eslint` to ^8.72.2

## 3.2.1

### Patch Changes

- e235985: Update `eslint-plugin-jsdoc` to ^65.3.12, `eslint-plugin-n` to
  ^18.5.0, `globals` to ^17.13.0 and `typescript-eslint` to ^8.71.2. Keep the
  existing rule presets and overrides.

## 3.2.0

### Minor Changes

- 4fb4825: minor dependency upgrades

### Patch Changes

- b7f4e25: disable 'unicorn/no-top-level-assignment-in-function'

## 3.1.0

### Minor Changes

- c68cba9: upgrade dependencies

### Patch Changes

- a6377f3: disable unicorn/prefer-uint8array-base64

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
