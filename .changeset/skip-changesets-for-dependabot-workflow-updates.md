---
'changelog': minor
---

Accept Dependabot pull requests that only update workflows without a changeset.

- Skip the changeset requirement when `dependabot[bot]` opened the pull request
  and it changes only files in `.github/workflows/`.
- Keep requiring a changeset for every other pull request.
