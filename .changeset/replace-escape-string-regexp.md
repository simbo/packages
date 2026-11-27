---
'@simbo/inject-between-html-comments': patch
---

Replace `escape-string-regexp` with the built-in `RegExp.escape()`.

- Remove the runtime dependency `escape-string-regexp`.
- Comment texts with special characters match as before.
