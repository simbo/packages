# Rules for assistants

pnpm and Turbo monorepo of the `@simbo/*` npm packages. Read
[README.md](README.md) and [NPM_PUBLISHING.md](NPM_PUBLISHING.md) first. Change
this file only when the owner asks for it; keep it to about one screen.

## Collaboration

- Talk to the owner in German. Everything in the repository is American English.
- The owner is the sole maintainer. Discuss before implementing; a discussion is
  not permission to start the work.
- No staging, commits, pushes, tags, releases, or changes to GitHub settings
  without an explicit request.
- Never read, write, or output secrets, not even in part. Refer to them by name.
- This repository is public. No internal details about other repositories,
  accounts, or their state.
- Change only this repository. Report changes needed elsewhere as a list.
- No new tooling, platforms, or dependencies without a request.

## Packages

- One workspace per package in `packages/<name>/`; tags are `<name>/v<version>`.
  `changelog/` holds the monorepo changelog.
- Every change comes with a changeset (`pnpm exec changeset`); use `--empty` for
  changes without a release. Breaking changes only after the owner agrees.
- `README.md` package counts and `PACKAGES.md` are generated
  (`pnpm packages-list`); do not edit them by hand.
- Commits follow Conventional Commits with a required scope: the workspace
  folder, or `repo`, `release`, `deps`.

## Code and checks

- Preserve the shared `@simbo` configurations; ask before changing their rules.
- Test behavior, including real Git or file system behavior where a package
  depends on it. Do not mirror the implementation in tests.
- Document public functions and interfaces with valid JSDoc.
- Verify with `pnpm preflight` and report checks that were not run.
