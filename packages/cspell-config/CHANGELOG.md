# @simbo/cspell-config

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

## 2.2.0

### Minor Changes

- d02fde1: Add color, accessibility and typeface terms to the dictionaries.

  - Abbreviations: `CMYK`, `DTCG`, `OSX`, `RGB`, `SIL`, `WCAG`.
  - Words: `Fira`, `Frutiger`, `Futura`, `Grotesk`, `Noto`.

### Patch Changes

- 6f304e0: Include the original sources in source maps (`inlineSources`), so
  debuggers and stack traces show the TypeScript code without publishing `src`.

## 2.1.1

### Patch Changes

- aa9def2: Ignore Git commit hash prefixes in Changesets-style CHANGELOG.md
  entries while continuing to check their descriptions.

## 2.1.0

### Minor Changes

- fcf5e8a: add "Magawa" to dictionary

## 2.0.1

### Patch Changes

- fd76b01: add "Umami" to known words

## 2.0.0

### Major Changes

- 2ded9ff: Require Node.js ^22.22.2 || ^24.15.0 || >=26.0.0 across all packages
  to align with the runtime requirements of the updated dependencies. Node.js
  20, 21, 23 and 25, as well as earlier Node.js 22 and 24 releases, are no
  longer supported. Upgrade to a supported Node.js version before updating these
  packages.

### Minor Changes

- 2ded9ff: Add support for CSpell 10 while retaining CSpell 9 compatibility.
  Update CSpell and its configuration types to 10.3.3 for development. Both
  supported CSpell versions are subject to this package's new shared Node.js
  requirement: ^22.22.2 || ^24.15.0 || >=26.0.0.

### Patch Changes

- 2ded9ff: Document the shared Node.js requirements and updated peer
  dependencies. Correct API documentation links, installation and usage
  examples, and repository development instructions. Clarify string count
  conversion, literal replacements and import metadata fallbacks.

## 1.4.0

### Minor Changes

- 9834c67: add "DMG" to dictionary

## 1.3.0

### Minor Changes

- 65efab1: add words "Tauri" and "unpushed"

### Patch Changes

- e6ee8cc: add package scripts to readme

## 1.2.0

### Minor Changes

- d0d7db1: add "Zodpak" to dictionary

## 1.1.2

### Patch Changes

- a6fee7f: add package keywords

## 1.1.1

### Patch Changes

- 648a6ea: add tests

## 1.1.0

### Minor Changes

- 911fde0: update dictionaries

## 1.0.0

### Major Changes

- a0243d5: Initial Release
