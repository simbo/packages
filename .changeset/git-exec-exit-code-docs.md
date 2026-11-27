---
'@simbo/git-exec': patch
---

Document when `GitError.exitCode` is `undefined`.

- The README explains that `exitCode` is `undefined` when Git could not be
  started, was terminated by a signal, or exceeded `maxBuffer`.
- An example shows how to tell a failed command from a Git that could not run.
