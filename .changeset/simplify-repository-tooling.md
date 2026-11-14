---
'changelog': minor
---

Simplify the repository tooling.

- Format all packages from the repository root instead of per package.
- Build the packages that root checks depend on through Turbo.
- Lint and type-check the TypeDoc configuration.
- Remove the unused `bundle` task and the duplicate `engine-strict` setting.
- Configure changesets for public packages and tag private packages.
- Pin pnpm with an integrity hash.
