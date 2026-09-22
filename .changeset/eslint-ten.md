---
'@simbo/eslint-config': major
---

Require ESLint 10.4 or newer within v10 and Node.js ^22.22.2 || >=24.15.0.
Upgrade the ESLint, Unicorn, JSDoc, Node.js and globals presets. Existing
configuration exports remain unchanged, but updated rules can report new errors.

Use ESLint's built-in configuration helpers, remove the duplicate JavaScript
JSDoc preset and obsolete test-rule comments, and preserve the existing JSDoc,
export and TypeScript naming conventions through explicit Unicorn overrides. Do
not require Temporal or RegExp.escape in projects targeting older runtimes.
