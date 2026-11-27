---
'packages-changelog': patch
---

Stabilize a slow `@simbo/cspell-config` test.

- Give the changelog commit hash test, which spawns a real CSpell CLI process, a
  30 second timeout so it no longer fails against the default 5 second limit
  under high system load.
