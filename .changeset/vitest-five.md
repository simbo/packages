---
'changelog': patch
---

Upgrade the repository's test tooling to Vitest 5.0.1, including the V8 coverage
provider and Vitest UI. Explicitly include source files in coverage reports, use
automatic mock clearing and replace deprecated `toThrowError` assertions with
`toThrow`.
