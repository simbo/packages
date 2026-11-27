---
'@simbo/find-bin': minor
---

Look up binaries with `npm-run-path` and `which` instead of the system `which`
command.

- `findBin()` searches the `node_modules/.bin` directories from the working
  directory up to the root first, then the directories in `PATH`, as before.
- The lookup no longer needs a `which` binary on the system, so it also finds
  binaries in `PATH` where none is installed.
- A name with a path separator, such as `./bin/tool`, is resolved against the
  working directory and no longer searched in `node_modules/.bin`.
- Relative directories in `PATH` are resolved against `process.cwd()` instead of
  the working directory.
- A `node_modules/.bin` directory that is already in `PATH` is checked at its
  position in `PATH`.
- Whether a file is executable is checked with its file mode instead of
  `access()`, which can differ for ACLs or `noexec` mounts.
- On Windows, the lookup follows `PATHEXT`, which is not tested.
