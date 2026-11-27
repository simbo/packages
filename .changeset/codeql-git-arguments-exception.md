---
'packages-changelog': patch
---

Record the CodeQL exception for packages that run Git with the arguments of
their callers.

- `js/second-order-command-line-injection` is accepted until 2027-11-27 for
  `@simbo/git-exec` and packages with the same purpose, because they pass the
  arguments to Git as given, without a shell.
- Their READMEs explain how to pass untrusted values after `--end-of-options` or
  `--`.
