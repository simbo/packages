---
'@simbo/find-up-package': major
'@simbo/clirk': major
---

Upgrade `normalize-package-data` to ^9.0.0 and `type-fest` to ^5.10.0 for
package metadata normalization and types.

The normalization dependency now requires Node.js ^22.22.2 || ^24.15.0 ||

> =26.0.0. This also affects Clirk through its dependency on
> `@simbo/find-up-package`. Upgrade to a supported Node.js runtime before
> updating.
