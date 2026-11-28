---
'packages-changelog': patch
---

Check the archive of every package with `check:pack`.

- `scripts/check-pack.js` packs a package with `pnpm pack`, as the release does,
  and fails if the packed manifest has another name or version or workspace
  ranges, or if a file that `exports`, `main`, `types`, or `bin` names, or the
  declaration file of an exported JavaScript file, is missing.
- Every published package gets a `check:pack` script; Turbo caches it and reruns
  it when the package, its build, or the check scripts change.
- The workspace range check is shared with `scripts/release-package.js`.
- `preflight` and `each:check` run the archive check.
