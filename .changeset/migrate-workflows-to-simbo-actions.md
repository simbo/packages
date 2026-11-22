---
'changelog': minor
---

Migrate the workflows to the published Simbo's Actions.

- Get the app token with `actions/create-github-app-token` in the `release`
  environment, with `contents: write` only, and only in the release and GitHub
  release workflows.
- Commit release bumps and create the release tags with
  `simbo-actions/signed-commit`, as a verified commit with lightweight tags.
- Release the commit checked by the checks workflow, and fail if the branch has
  moved since then.
- Create GitHub releases with `simbo-actions/staged-release`, without marking
  them as the latest release.
- Use `GITHUB_TOKEN` for checks, the release dispatch, npm publishing, and the
  docs deployment.
- Pin all actions by commit SHA, set minimal permissions per job, and keep
  checkout credentials out of the working tree.
- Require pull requests to add a changeset instead of accepting any pending one,
  and drop the removed bundle step from the checks.
