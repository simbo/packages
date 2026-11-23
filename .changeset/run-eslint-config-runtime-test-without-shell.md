---
'changelog': patch
---

Run the ESLint binary in the `eslint-config` runtime test without a shell.

- Pass the arguments to `execFile()` instead of building a command string for
  `exec()`, so paths with spaces or shell characters keep working.
- Resolve the CodeQL alert `js/shell-command-injection-from-environment`.
