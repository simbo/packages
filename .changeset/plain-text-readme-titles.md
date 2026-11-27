---
'@simbo/monorepo-utils': patch
---

Read the title of a workspace README as plain text.

- `title` of the workspace metadata drops images and HTML tags, keeps only the
  text of links, and removes emphasis, strong emphasis, strikethrough, inline
  code, and a closing sequence of `#`. Escaped characters stay as they are
  written, and whitespace is collapsed.

- A README whose H1 holds no text, such as one of images only, fails like a
  README without an H1.
