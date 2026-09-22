---
'@simbo/plural': major
---

Convert string counts with `Number` before truncating instead of parsing a
decimal integer prefix. Strings with trailing text such as `"2items"` now fall
back to zero, while scientific notation such as `"1e2"` is interpreted as 100.
Pass a number explicitly to preserve a particular parsing strategy.
