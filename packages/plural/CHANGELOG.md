# @simbo/plural

## 2.0.0

### Major Changes

- 2ded9ff: Convert string counts with `Number` before truncating instead of
  parsing a decimal integer prefix. Strings with trailing text such as
  `"2items"` now fall back to zero, while scientific notation such as `"1e2"` is
  interpreted as 100. Pass a number explicitly to preserve a particular parsing
  strategy.
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
- 2ded9ff: Preserve literal dollar-sign replacement tokens such as `$&` and `$$`
  in formatted words and injected content.

## 1.0.1

### Patch Changes

- aeaa010: update readme

## 1.0.0

### Major Changes

- d518c73: Initial Release
