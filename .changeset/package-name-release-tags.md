---
'packages-changelog': patch
---

Name release tags after the full package name, as in
`@simbo/eslint-config/v3.4.0`.

- Release assets carry the name that `pnpm pack` gives them, as in
  `simbo-eslint-config-3.4.0.tgz`; existing releases keep their asset names.
- The release scripts find a workspace by its package name in every workspace
  folder instead of below `packages/`.
- The bumped packages after `changeset version` come from a script with the
  outputs of the planned `version-bumps` action.
- Manual runs of the GitHub Release and Publish workflows take `name` and
  `version`.
