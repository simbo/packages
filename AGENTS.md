# Rules for assistants

pnpm and Turbo monorepo of the `@simbo/*` npm packages. Read
[README.md](README.md) and [NPM_PUBLISHING.md](NPM_PUBLISHING.md) first. For
maintenance, follow the runbooks in [MAINTAINING.md](MAINTAINING.md). Change
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
- Write handoffs to `.handoffs/`, not `docs/handoffs/`: `docs/` is the TypeDoc
  output and is emptied on every run.

## Packages

- One workspace per package in `packages/<folder>/`; `changelog/` holds the
  monorepo changelog as the private `packages-changelog`. Workspaces are listed
  in `pnpm-workspace.yaml` and `workspaces`; tools find them there, not by
  `packages/` paths. Tags are `<name>/v<version>` with the full package name,
  such as `@simbo/eslint-config/v3.4.0`. Every package has a `turbo.json` with
  one layer tag (see "Checks" in [README.md](README.md)).
- Every change gets a changeset, as described in "Writing Changesets" in
  [README.md](README.md): a package changeset when the published package changes
  for its users, otherwise one for the private `packages-changelog`; one topic
  each, a summary paragraph with the details as a list, never empty. Breaking
  changes only after the owner agrees.
- `README.md` package counts and `PACKAGES.md` are generated
  (`pnpm packages-list`); do not edit them by hand.
- Commits follow Conventional Commits with a required scope: the workspace
  folder, or `repo`, `release`, `deps`.

## Code and checks

- Preserve the shared `@simbo` configurations; ask before changing their rules.
- Test behavior, including real Git or file system behavior where a package
  depends on it. Do not mirror the implementation in tests.
- Document public functions and interfaces with valid JSDoc.
- Support the Node.js versions that Node.js itself still maintains (`engines`).
  `@types/node` follows the lowest supported major, `.nvmrc` the current Active
  LTS.
- Verify with `pnpm preflight` and report checks that were not run.
