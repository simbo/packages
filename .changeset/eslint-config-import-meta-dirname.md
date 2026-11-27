---
'@simbo/eslint-config': major
---

Check `import.meta.dirname` against the Node.js versions in `engines`.

- `n/no-unsupported-features/node-builtins` no longer ignores
  `import.meta.dirname`, which every supported Node.js version provides.
- The README explains that the Node.js version checks read `engines.node` from
  the nearest `package.json`.

Set `engines.node` in every linted package, including nested folders with their
own `package.json`. Without it, `eslint-plugin-n` assumes `>=16.0.0` and reports
`import.meta.dirname`, for example in `tsconfigRootDir: import.meta.dirname` in
`eslint.config.ts`.
