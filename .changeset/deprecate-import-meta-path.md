---
'@simbo/import-meta-path': patch
---

Deprecate the package in favor of `import.meta.dirname` and
`import.meta.filename`, which all supported Node.js versions provide.

- Add a deprecation notice and a migration example to the `README.md`.
- Mark `importMetaPath()` as `@deprecated`.
- Point the `homepage` to the tag of this release, because the package will be
  removed from the repository.

This is the final release. The package receives no further updates.
