# @simbo/tsconfig

## 3.0.1

### Patch Changes

- ef1d1e5: Document how to build without source maps.

  - The README explains that `sourceMap: false` also needs
    `inlineSources: false`, because the base configuration enables both and
    TypeScript otherwise fails with TS5051.

## 3.0.0

### Major Changes

- 19c8dc1: Require Node.js ^24.15.0 || >=26.0.0 across all packages, as Node.js
  22 reaches its end of life on 2027-04-30.

  - Remove `^22.22.2` from `engines.node` in every package.
  - Update the requirements in the package READMEs.

  Node.js 22 is no longer supported. Upgrade to Node.js ^24.15.0 or >=26.0.0
  before updating these packages.

- 19c8dc1: Target ES2024 and include the ES2025 library in the Node.js
  configuration.

  - `@simbo/tsconfig/node` sets `target` to `ES2024` and `lib` to `["ES2025"]`,
    which all supported Node.js versions run, for example `RegExp.escape()`,
    `Promise.try()` and iterator helpers.
  - The `typescript` peer dependency requires ^6, because TypeScript ships the
    ES2025 library from 6.0 on.
  - `@simbo/tsconfig/browser` does not change.

  Update to TypeScript 6 before updating this package. Projects that extend
  `@simbo/tsconfig/node` get the ES2024 and ES2025 types and syntax, so run
  their type checks after the update.

### Patch Changes

- 19c8dc1: Point the `repository` field of the manifest to the workspace folder.

  - `repository` uses the object form with `type`, `url`, and `directory`, so
    npm links the package folder and resolves relative links in the README from
    there.
  - `packages-changelog` gets the field for the first time.

## 2.1.0

### Minor Changes

- 6f304e0: Include the original sources in source maps (`inlineSources`), so
  debuggers and stack traces show the TypeScript code without publishing `src`.

## 2.0.0

### Major Changes

- 2ded9ff: Require Node.js ^22.22.2 || ^24.15.0 || >=26.0.0 across all packages
  to align with the runtime requirements of the updated dependencies. Node.js
  20, 21, 23 and 25, as well as earlier Node.js 22 and 24 releases, are no
  longer supported. Upgrade to a supported Node.js version before updating these
  packages.
- 2ded9ff: Add TypeScript 6 support while retaining TypeScript 5 compatibility.
  Explicitly include Node.js types in the Node.js configuration for the new
  TypeScript 6 defaults. This stops automatically including other installed
  global type packages, including when using TypeScript 5. Install `@types/node`
  and explicitly list any additional global types alongside `node` in
  `compilerOptions.types` when extending the Node.js configuration.

### Patch Changes

- 2ded9ff: Document the shared Node.js requirements and updated peer
  dependencies. Correct API documentation links, installation and usage
  examples, and repository development instructions. Clarify string count
  conversion, literal replacements and import metadata fallbacks.

## 1.0.4

### Patch Changes

- aeaa010: update readme

## 1.0.3

### Patch Changes

- 275959f: fix package files
- a6fee7f: add package keywords

## 1.0.2

### Patch Changes

- 5a13d4e: add tests
- 1a4493c: improve package file structure

## 1.0.1

### Patch Changes

- 351d7a2: fix typo in package description

## 1.0.0

### Major Changes

- fb86c78: Initial Release
