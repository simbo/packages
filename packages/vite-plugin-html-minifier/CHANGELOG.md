# @simbo/vite-plugin-html-minifier

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
