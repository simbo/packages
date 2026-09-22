# @simbo/tsconfig

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
