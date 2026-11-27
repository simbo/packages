---
'@simbo/accessible': major
'@simbo/call-prettier': major
'@simbo/cli-output': major
'@simbo/clirk': major
'@simbo/commitlint-config': major
'@simbo/cspell-config': major
'@simbo/eslint-config': major
'@simbo/find-bin': major
'@simbo/find-git-repository-root': major
'@simbo/find-up-package': major
'@simbo/git-changes': major
'@simbo/git-constants': major
'@simbo/globby-has-matches': major
'@simbo/graceful-exit': major
'@simbo/inject-between-html-comments': major
'@simbo/is-git-repository-root': major
'@simbo/monorepo-packages-list-cli': major
'@simbo/monorepo-packages-list': major
'@simbo/monorepo-utils': major
'@simbo/package-json': major
'@simbo/plural': major
'@simbo/prettier-config': major
'@simbo/rollup-github-actions-config': major
'@simbo/stringify-error': major
'@simbo/tsconfig': major
'@simbo/user-facing-error': major
'@simbo/vite-plugin-html-minifier': major
'@simbo/vite-plugin-nunjucks': major
'@simbo/zodpak': major
---

Require Node.js ^24.15.0 || >=26.0.0 across all packages, as Node.js 22 reaches
its end of life on 2027-04-30.

- Remove `^22.22.2` from `engines.node` in every package.
- Update the requirements in the package READMEs.

Node.js 22 is no longer supported. Upgrade to Node.js ^24.15.0 or >=26.0.0
before updating these packages.
