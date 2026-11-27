---
'@simbo/package-json': minor
---

Add `writePackageJson()`, `updatePackageJson()` and `sortPackageJson()`.

- `writePackageJson()` writes with `write-package`: atomically, creating missing
  directories, keeping the indentation and trailing newline of an existing file,
  and using two spaces for new files unless `indent` is set. Empty dependency
  objects are removed and dependencies are sorted alphabetically.
- `updatePackageJson()` reads an existing file and writes what the updater
  changes in place or returns, so it can also remove keys and replace arrays. It
  rejects if the file does not exist.
- `sortPackageJson()` returns a sorted copy with `sort-package-json`. Top-level
  keys follow the order of the `@simbo` packages unless `sortOrder` is set;
  scripts are grouped by colons with the main script first and `pre` and `post`
  scripts next to it.
- `writePackageJson()` and `updatePackageJson()` sort before writing with the
  `sort` option.
- New dependencies: `write-package` ^7.2.0 and `sort-package-json` ^4.1.0.
