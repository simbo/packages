---
'@simbo/git-fixture': patch
---

Document how to set and restore the environment for the code under test.

- The README shows `vi.stubEnv()` in `beforeEach()` and `vi.unstubAllEnvs()`
  with `cleanup()` in `afterEach()`.
- It notes that the variables apply to the whole test process until they are
  restored.
