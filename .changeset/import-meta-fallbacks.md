---
'@simbo/import-meta-path': patch
---

Use nullish fallbacks for `import.meta.dirname` and `import.meta.filename`,
preserving explicitly supplied empty strings. Clarify that an invalid path type
must be either `dir` or `file` in the error message.
