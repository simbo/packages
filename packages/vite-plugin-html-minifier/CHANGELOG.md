# @simbo/vite-plugin-html-minifier

## 2.0.0

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

## 1.0.2

### Patch Changes

- 6f304e0: Include the original sources in source maps (`inlineSources`), so
  debuggers and stack traces show the TypeScript code without publishing `src`.

## 1.0.1

### Patch Changes

- a23c3c2: Publish a maintenance release to validate automated npm publishing.
  No runtime changes.

## 1.0.0

### Major Changes

- ea83862: Add a build-only Vite 8 HTML minifier with shared whitespace and
  comment defaults, typed html-minifier-terser overrides, multi-page output
  support and integration with Nunjucks template rendering.
