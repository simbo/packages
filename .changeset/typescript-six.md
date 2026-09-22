---
'@simbo/tsconfig': major
---

Add TypeScript 6 support while retaining TypeScript 5 compatibility. Explicitly
include Node.js types in the Node.js configuration for the new TypeScript 6
defaults. This stops automatically including other installed global type
packages, including when using TypeScript 5. Install `@types/node` and
explicitly list any additional global types alongside `node` in
`compilerOptions.types` when extending the Node.js configuration.
