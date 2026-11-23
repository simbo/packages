# Maintaining

Runbooks for recurring maintenance. Each runbook links the documents that hold
the details instead of repeating them. `main` accepts changes only through
squash-merged pull requests. Run `pnpm run preflight` before opening or merging
a pull request and fix what it reports.

## GitHub Actions Updates

Dependabot checks the actions in `.github/workflows/` daily (see
`.github/dependabot.yml`). Updates of `simbo-actions/*` arrive grouped and
without cooldown; all other actions arrive as one pull request each after a
cooldown of 7 days.

1. Read the release notes and changelogs of every version between the old and
   the new one, not only the latest.
2. Look for changes that affect the workflows: a new Node.js runtime of the
   action, removed or renamed inputs and outputs, changed defaults, and changed
   permissions or token handling.
3. Check that the pinned commit SHA belongs to the tag in the version comment
   and that the action is still published by the same owner.
4. Make sure all checks of the pull request pass. Dependabot pull requests that
   only change `.github/workflows/` need no changeset.
5. Merge one update at a time and confirm that the next run of each affected
   workflow passes.

## npm Dependency Updates

1. Update in steps, from the safest to the riskiest:

   ```bash
   pnpm run ncu:patch
   pnpm run ncu:minor
   pnpm run ncu:latest
   ```

   `ncu:latest` skips `@types/node` and `typescript`; update them only as
   described in [Node.js Versions](#nodejs-versions).

2. For every major update, read the release notes and adapt the code and the
   configurations to the changes.
3. Run `pnpm install` and `pnpm run preflight`.
4. Write changesets as described in "Writing Changesets" in
   [README.md](README.md): a package changeset for runtime dependencies of a
   published package, a `changelog` changeset for development dependencies.

## Security Alerts

Dependabot security updates try to fix vulnerable npm dependencies in the
lockfile. When no update is possible because a dependent pins the vulnerable
range, assess the risk, record an exception below, and dismiss the alert on
GitHub with the same reason.

- `minimatch` 10
  ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)) is
  accepted until 2026-12-31. `typedoc` 0.28.20 requires `^10.2.5` and uses
  `matchOne()`, which minimatch 11 removes, so an override would break the docs.
  Here it only runs in linting and the docs build, with glob patterns from this
  repository's configuration. Remove the exception when `typedoc` supports
  minimatch 11 and `typescript-eslint` is updated to 8.73.0 or newer.

CodeQL code scanning reports findings in the code itself, test code included.
Fix them in the code where possible; a merge to `main` closes the alert. Dismiss
an alert only with an exception recorded in this section and the same reason on
GitHub.

## Node.js Versions

Check the [Node.js release schedule](https://github.com/nodejs/Release) when a
release line starts or reaches its end of life.

- `engines` in every `package.json` lists the release lines that Node.js still
  maintains. Dropping a line is a breaking change for every published package.
- `@types/node` follows the lowest supported major. It stays on 24 until Node.js
  22 reaches its end of life (2027-04-30), because its `undici-types` dependency
  fails the pnpm trust policy.
- `.nvmrc` holds the current Active LTS release. The workflows read it through
  `node-version-file`.
- Update the requirements in [README.md](README.md) together with these files.

## Pull Requests from Contributors

1. Review the changes before approving the workflow runs of a pull request from
   a fork.
2. Check that the pull request follows the commit and changeset rules, and add a
   missing changeset if the contributor agrees.
3. Make sure all checks pass before merging.

## Releases and npm Publishing

Releases run automatically when changesets reach `main`; see "Releases" in
[README.md](README.md). For first publishes, trusted publishing and retries, see
[NPM_PUBLISHING.md](NPM_PUBLISHING.md).

After a release, confirm that the Release, GitHub Release and Publish workflows
passed for every bumped package.

## Exceptions

An exception to a rule, such as an ignored finding or a held back dependency,
needs a reason and an expiry date. Record it next to the rule it affects, as
done for `@types/node` above, and remove it when it expires.
