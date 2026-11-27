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
   published package, a `packages-changelog` changeset for development
   dependencies.

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
- `deepmerge-ts` 7
  ([advisory](https://github.com/advisories/GHSA-ggr8-5vv4-36mx)) is overridden
  with `^8.0.2` for `write-package` in `pnpm-workspace.yaml` until 2027-02-28.
  `write-package` 7.2.0 requires `^7.1.0` but only calls `deepmerge()`, whose
  behavior version 8 keeps. The override does not reach users of
  `@simbo/package-json`. Remove it when `write-package` requires deepmerge-ts 8,
  and update `write-package` with it.

CodeQL code scanning reports findings in the code itself, test code included.
Fix them in the code where possible; a merge to `main` closes the alert. Dismiss
an alert only with an exception recorded in this section and the same reason on
GitHub.

- `js/second-order-command-line-injection` in `@simbo/git-exec` and in packages
  whose purpose is to run Git with arguments of their callers, such as a test
  fixture built on it, is accepted until 2027-11-27. Running Git with the
  arguments the caller chooses is what these packages are for. They use
  `execFile` without a shell, and a list of forbidden options would be
  incomplete and block legitimate calls. Their READMEs tell callers to pass
  untrusted values only after `--end-of-options` or `--`. Review the exception
  by its date, and dismiss each alert as "Won't fix" with this reason.

## Node.js Versions

Check the [Node.js release schedule](https://github.com/nodejs/Release) when a
release line starts or reaches its end of life.

- `engines` in every `package.json` lists the release lines that Node.js still
  maintains. Dropping a line is a breaking change for every published package.
- `@types/node` follows the lowest supported major.
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

After a release, confirm that the Release, GitHub Release, Publish and Docs
workflows passed for every bumped package. Retry a failed Release or Docs run
with "Re-run"; a run started by hand is skipped.

## Deprecating a Package

A deprecated package gets a final release with a deprecation notice and is then
removed from the monorepo. This takes two pull requests: `changeset version`
fails for changesets of a package that no longer exists, and the final release
must be built from a tag that still contains it.

1. Find internal users and replace them, including development dependencies,
   configurations and examples in other packages:

   ```bash
   git grep -n '<package-name>' -- ':!packages/<workspace>/' ':!pnpm-lock.yaml'
   ```

   Ignore the generated `PACKAGES.md`. A replacement that changes a published
   package needs its own package changeset.

2. Open the first pull request for the final release of the package:
   - Add a deprecation notice with the replacement and a migration example to
     the top of its `README.md`, and replace the API documentation link: the
     TypeDoc pages of the package disappear with the removal.
   - Mark its public functions as `@deprecated` in JSDoc, and disable
     `@typescript-eslint/no-deprecated` in their tests.
   - Start the `description` in `package.json` with `Deprecated:`.
   - Point `homepage` in `package.json` and the repository links in its
     `README.md` to the tag of the final release
     (`tree/<package-name>/v<version>`), because `main` will no longer contain
     the package.
   - Add a patch changeset for the package that names the replacement, as
     described in "Writing Changesets" in [README.md](README.md).

3. After the merge, confirm that the Release, GitHub Release and Publish
   workflows passed and that npm serves the final version:

   ```bash
   npm view <package-name> version
   ```

4. The owner deprecates all published versions on npm and removes the trusted
   publisher of the package in its npm settings (see
   [NPM_PUBLISHING.md](NPM_PUBLISHING.md)):

   ```bash
   npm deprecate '<package-name>' '<message with the replacement>'
   ```

5. Open the second pull request to remove the workspace:
   - Make sure that no pending changeset in `.changeset/` names the package.
   - Delete `packages/<workspace>/` and update the lockfile. Remove the
     workspace state first, otherwise `pnpm install` reports "Already up to
     date" and keeps the importer of the deleted workspace, which
     `--frozen-lockfile` does not detect:

     ```bash
     rm -rf packages/<workspace> node_modules/.pnpm-workspace-state*.json
     pnpm install
     git grep -n 'packages/<workspace>:' -- pnpm-lock.yaml
     ```

     The last command must find nothing.

   - Run `pnpm run packages-list` to update `PACKAGES.md` and the package count
     in [README.md](README.md).
   - Add a changeset for the private `packages-changelog` package.

   The Turbo layer tag, the boundaries check, Vitest and the release scripts
   find workspaces through the workspace patterns, TypeDoc through the
   `packages/*` glob; none of them needs a change. Search the root
   configurations and `.github/` for the workspace name to be sure.

6. Keep the tags `<package-name>/v*` and their GitHub releases. They document
   the published versions, and the publish workflow needs them for retries.
   After the merge, confirm that the Docs workflow removed the TypeDoc pages of
   the package.

## Exceptions

An exception to a rule, such as an ignored finding or a held back dependency,
needs a reason and an expiry date. Record it next to the rule it affects, as
done for `minimatch` in [Security Alerts](#security-alerts), and remove it when
it expires.
