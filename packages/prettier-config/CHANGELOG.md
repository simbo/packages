# @simbo/prettier-config

## 4.0.0

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

## 3.0.2

### Patch Changes

- 6f304e0: Include the original sources in source maps (`inlineSources`), so
  debuggers and stack traces show the TypeScript code without publishing `src`.

## 3.0.1

### Patch Changes

- 757c441: Enable the JSX parser plugin for import sorting to correctly format
  JSX and TSX files.

## 3.0.0

### Major Changes

- 2ded9ff: Require Node.js ^22.22.2 || ^24.15.0 || >=26.0.0 across all packages
  to align with the runtime requirements of the updated dependencies. Node.js
  20, 21, 23 and 25, as well as earlier Node.js 22 and 24 releases, are no
  longer supported. Upgrade to a supported Node.js version before updating these
  packages.

### Patch Changes

- 2ded9ff: Document the shared Node.js requirements and updated peer
  dependencies. Correct API documentation links, installation and usage
  examples, and repository development instructions. Clarify string count
  conversion, literal replacements and import metadata fallbacks.

## 2.0.0

### Major Changes

- dcdeee1: remove usage of plugin-prettier-organize-attributes

## 1.0.6

### Patch Changes

- 8afb7d1: add package scripts to readme

## 1.0.5

### Patch Changes

- fa89dd7: fix vue options

## 1.0.4

### Patch Changes

- aeaa010: update readme

## 1.0.3

### Patch Changes

- a6fee7f: add package keywords

## 1.0.2

### Patch Changes

- 744b6ac: add tests

## 1.0.1

### Patch Changes

- 183e705: set required plugins as peerDependencies

## 1.0.0

### Major Changes

- a0243d5: Initial Release
