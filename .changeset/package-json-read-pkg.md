---
'@simbo/package-json': minor
---

Read package.json files with `read-pkg` instead of `JSON.parse()`.

- The content is still returned as is, without normalization.
- For invalid JSON, the message after `Failed to read package.json:` adds the
  code point of the unexpected character and, if the position is known, an
  excerpt of the file, and `cause` is a `JSONError` from `parse-json` instead of
  a `SyntaxError`.
- New dependency: `read-pkg` ^10.1.0.

Code that matches the error message beyond its prefix or checks `cause` for a
`SyntaxError` needs an update.
