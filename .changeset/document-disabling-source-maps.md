---
'@simbo/tsconfig': patch
---

Document how to build without source maps.

- The README explains that `sourceMap: false` also needs `inlineSources: false`,
  because the base configuration enables both and TypeScript otherwise fails
  with TS5051.
