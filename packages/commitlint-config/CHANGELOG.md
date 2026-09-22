# @simbo/commitlint-config

## 2.0.0

### Major Changes

- 2ded9ff: Require `@commitlint/cli` ^21.2.3 and upgrade the conventional commit
  preset to ^21.2.3. Projects using Commitlint 20 must upgrade to Commitlint 21.

  The updated conventional commit preset requires Node.js 22.12.0 or newer.

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

## 1.0.7

### Patch Changes

- 2c35936: bind commitlint cli peer dependency to catalog version

## 1.0.6

### Patch Changes

- 6457f71: upgrade dependencies

## 1.0.5

### Patch Changes

- 1b44321: add git hooks setup to readme

## 1.0.4

### Patch Changes

- aeaa010: update readme

## 1.0.3

### Patch Changes

- a6fee7f: add package keywords

## 1.0.2

### Patch Changes

- 0ddaa38: fix tests for scope usage

## 1.0.1

### Patch Changes

- 835f5be: require a scope for every commit

## 1.0.0

### Major Changes

- a0243d5: Initial Release
