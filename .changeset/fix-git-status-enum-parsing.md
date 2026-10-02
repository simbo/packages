---
'@simbo/git-changes': patch
---

Parse Git status characters into enum members without unsafe type assertions and
allow the added status in the unstaged type to match existing parser behavior.
