---
'packages-changelog': minor
---

Drop Node.js 22 from the repository's supported Node.js versions.

- Require Node.js ^24.15.0 || >=26.0.0 in the root and `packages-changelog`
  workspaces.
- Update the requirements in `README.md` and the documentation index.
- Remove the `@types/node` exception for Node.js 22 from `MAINTAINING.md` and
  `AGENTS.md`; `@types/node` stays on 24 as the lowest supported major.
