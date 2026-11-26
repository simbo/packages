---
'packages-changelog': patch
---

Exclude the local `.claude/` folder from Prettier, so that agent worktrees
inside it do not break the format check.
