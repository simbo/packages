---
'packages-changelog': patch
---

Run the integration tests of `@simbo/git-changes` on `@simbo/git-fixture`.

- The temporary repository comes from `createGitFixture()` instead of a local
  helper with `execa`.
- The tests set the neutral Git configuration of the fixture for the process, so
  that `getGitChanges()` does not read the configuration of the host.
