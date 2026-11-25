---
'changelog': patch
---

Add a runbook for deprecating a package to `MAINTAINING.md`.

- Release a final version with a deprecation notice before removing the
  workspace, in two pull requests.
- Deprecate the published versions on npm and remove the trusted publisher.
- Keep the release tags and GitHub releases of the package.
