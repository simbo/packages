---
'@simbo/monorepo-packages-list-cli': major
---

Upgrade configuration discovery in the packages list CLI to Cosmiconfig ^10.0.1
and `cosmiconfig-typescript-loader` ^6.3.0. Cosmiconfig 10 requires Node.js
^22.18 || >=24.

Together with the updated package normalization dependency used through Clirk,
the CLI now requires Node.js ^22.22.2 || ^24.15.0 || >=26.0.0. Node.js 20 is no
longer supported; upgrade the runtime before updating the CLI.
