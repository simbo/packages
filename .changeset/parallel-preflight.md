---
'packages-changelog': patch
---

Run `preflight` in two parallel phases.

- The first Turbo run builds all packages and runs the ESLint and type checks of
  the packages and the root.
- The second Turbo run runs the tests, TypeDoc, and the format, spelling, and
  boundaries checks in parallel; `docs:typedoc` runs TypeDoc without the build.
- Both runs show only the logs of failed tasks and continue after a failure, so
  one run reports all failures.
- CSpell skips the TypeDoc output in `docs/`, which TypeDoc rewrites while
  CSpell runs; the sources of those pages are checked directly.
