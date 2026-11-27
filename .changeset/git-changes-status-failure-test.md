---
'packages-changelog': patch
---

Break `git status` in the failure test of `git-changes` with a corrupt index
instead of a missing `HEAD`.

- Without `HEAD`, Git no longer finds the repository, so the root detection
  fails before `git status` runs.
