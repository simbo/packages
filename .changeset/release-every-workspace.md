---
'packages-changelog': patch
---

Create a GitHub release for every workspace, private ones included.

- The Publish workflow verifies every release and publishes it to npm only if
  the packed manifest is not private.
- Only `packages-changelog` releases become the latest release.
