---
'packages-changelog': patch
---

Check only the affected packages in pull requests that change only workspaces.

- The Checks workflow passes `--affected` to the ESLint, type, and archive
  checks when a pull request changes only files in workspaces and `.changeset/`.
  Turbo then checks the changed packages and their dependents.
- Pull requests that change root files, such as the lockfile, `turbo.json`, or
  workflows, and pushes to `main` check everything.
- The workflow always builds all packages and runs the tests, TypeDoc, and the
  format, spelling, and boundaries checks.
- `preflight:checks` and `preflight:repository` hold the two Turbo runs, so
  `preflight` and the workflow run the same tasks.
