---
'@simbo/eslint-config': patch
---

Document the versioning policy in the README.

- A change that can make a previously passing lint run fail is a major release.
- Changes that cannot add lint errors are minor, documentation and internal
  changes are patches.
- Minor releases of the bundled plugins can report new errors without a release
  of this package.
