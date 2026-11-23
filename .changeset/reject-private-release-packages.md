---
'changelog': patch
---

Reject private packages when validating a release tag instead of skipping them.

- Fail `scripts/release-package.js metadata` for private workspaces, so no job
  builds, packs, or downloads them.
- Remove the skip steps and their conditions from the GitHub release and publish
  workflows.
- Drop the `private` output and the duplicate check in
  `scripts/publish-release.js`.
