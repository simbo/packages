---
'changelog': minor
---

Build package archives once in the GitHub release workflow, then verify and
publish the same release tarballs to npm. Decouple release creation from
registry availability and document first publishes and retries using release
assets.

Add an interactive pnpm command to download, verify and publish release archives
locally, including a read-only check mode and tests for invalid release assets.

Keep repository helpers in scripts/ and run their tests through Vitest alongside
package tests, with a dedicated scripts project for focused runs.
