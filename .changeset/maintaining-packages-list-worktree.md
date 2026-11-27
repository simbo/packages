---
'packages-changelog': patch
---

Remove the note that `pnpm run packages-list` must run in a regular clone.

- The packages list CLI finds the monorepo root, so it updates the files of the
  worktree it runs in.
