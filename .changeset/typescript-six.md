---
'@simbo/tsconfig': minor
---

Add TypeScript 6 support while retaining TypeScript 5 compatibility. Explicitly
include Node.js types in the Node.js configuration for the new TypeScript 6
defaults. Projects needing additional global types should include them alongside
`node` in `compilerOptions.types`.
