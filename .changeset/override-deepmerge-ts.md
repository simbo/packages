---
'packages-changelog': patch
---

Override `deepmerge-ts` with ^8.0.2 for `write-package` to fix a
[security advisory](https://github.com/advisories/GHSA-ggr8-5vv4-36mx).

- `write-package` 7.2.0 requires `deepmerge-ts` ^7.1.0 and only calls
  `deepmerge()`, which behaves the same in version 8.
- The exception is recorded in `MAINTAINING.md` until 2027-02-28.
