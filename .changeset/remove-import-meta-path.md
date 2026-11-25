---
'changelog': patch
---

Remove the deprecated `@simbo/import-meta-path` package from the repository.

- Delete the workspace; the published versions stay on npm, deprecated in favor
  of `import.meta.dirname` and `import.meta.filename`.
- Keep the tags `import-meta-path/v*` and their GitHub releases.
