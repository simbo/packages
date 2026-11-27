---
'packages-changelog': patch
---

Rename the private `changelog` package to `packages-changelog` and move it to
`./changelog/`.

- The package name is unscoped, never published, and free on npm, so it can be
  used in release tags.
- The workspace now lives next to `packages/` and is listed in
  `pnpm-workspace.yaml` and `workspaces`.
- Its archive contains `CHANGELOG.md` besides the files that pnpm always packs.
