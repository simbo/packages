---
'@simbo/accessible': patch
'@simbo/call-prettier': patch
'@simbo/cli-output': patch
'@simbo/clirk': patch
'@simbo/commitlint-config': patch
'@simbo/cspell-config': patch
'@simbo/eslint-config': patch
'@simbo/find-bin': patch
'@simbo/find-git-repository-root': patch
'@simbo/find-up-package': patch
'@simbo/git-changes': patch
'@simbo/git-constants': patch
'@simbo/globby-has-matches': patch
'@simbo/graceful-exit': patch
'@simbo/inject-between-html-comments': patch
'@simbo/is-git-repository-root': patch
'@simbo/monorepo-packages-list-cli': patch
'@simbo/monorepo-packages-list': patch
'@simbo/monorepo-utils': patch
'@simbo/package-json': patch
'@simbo/plural': patch
'@simbo/prettier-config': patch
'@simbo/rollup-github-actions-config': patch
'@simbo/stringify-error': patch
'@simbo/tsconfig': patch
'@simbo/user-facing-error': patch
'@simbo/vite-plugin-html-minifier': patch
'@simbo/vite-plugin-nunjucks': patch
'@simbo/zodpak': patch
'packages-changelog': patch
---

Point the `repository` field of the manifest to the workspace folder.

- `repository` uses the object form with `type`, `url`, and `directory`, so npm
  links the package folder and resolves relative links in the README from there.
- `packages-changelog` gets the field for the first time.
