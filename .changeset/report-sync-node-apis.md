---
'@simbo/eslint-config': major
---

Report synchronous Node.js APIs with `n/no-sync` in the Node.js presets.

- `configs.node.recommended` and `nConfigs.node.recommended` enable the rule as
  an error, including at the top level of modules.
- A justified sync call stays possible with
  `// eslint-disable-next-line n/no-sync -- <reason>`.

Calls such as `readFileSync`, `execFileSync` or `spawnSync` now fail the lint
run. Replace them with `node:fs/promises` or `promisify(execFile)`, or disable
the rule for that line and name the reason.
