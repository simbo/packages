# packages-changelog

## 1.7.8

### Patch Changes

- 1f3126b: Create annotated release tags with `simbo-actions/signed-commit`
  v2.0.0.

  - Each tag has the app as tagger and the message `Release <tag>`.
  - Existing tags were migrated to the same form.

- 1f3126b: Dispatch the Release and Docs workflows with `gh workflow run`
  instead of repository dispatch events.

  - The dispatching jobs need only `actions: write`, not `contents: write` or
    the app token; `peter-evans/repository-dispatch` is no longer used.
  - The Release and Docs workflows run only when dispatched by the previous
    workflow on `main`; manual runs are skipped, and "Re-run" keeps the original
    actor.
  - The Release workflow fails if `main` has moved on from the checked commit;
    the Docs workflow builds the release commit instead of the current `main`.

- 1f3126b: Exclude the local `.claude/` folder from Prettier, so that agent
  worktrees inside it do not break the format check.
- 1f3126b: Name release tags after the full package name, as in
  `@simbo/eslint-config/v3.4.0`.

  - Release assets carry the name that `pnpm pack` gives them, as in
    `simbo-eslint-config-3.4.0.tgz`; existing releases keep their asset names.
  - The release scripts find a workspace by its package name in every workspace
    folder instead of below `packages/`.
  - The bumped packages after `changeset version` come from a script with the
    outputs of the planned `version-bumps` action.
  - Manual runs of the GitHub Release and Publish workflows take `name` and
    `version`.

- 1f3126b: Create a GitHub release for every workspace, private ones included.

  - The Publish workflow verifies every release and publishes it to npm only if
    the packed manifest is not private.
  - Only `packages-changelog` releases become the latest release.

- 1f3126b: Rename the private `changelog` package to `packages-changelog` and
  move it to `./changelog/`.

  - The package name is unscoped, never published, and free on npm, so it can be
    used in release tags.
  - The workspace now lives next to `packages/` and is listed in
    `pnpm-workspace.yaml` and `workspaces`.
  - Its archive contains `CHANGELOG.md` besides the files that pnpm always
    packs.

## 1.7.7

### Patch Changes

- 73b6108: Remove the deprecated `@simbo/import-meta-path` package from the
  repository.

  - Delete the workspace; the published versions stay on npm, deprecated in
    favor of `import.meta.dirname` and `import.meta.filename`.
  - Keep the tags `import-meta-path/v*` and their GitHub releases.

## 1.7.6

### Patch Changes

- ea7f0c0: Add a runbook for deprecating a package to `MAINTAINING.md`.

  - Release a final version with a deprecation notice before removing the
    workspace, in two pull requests.
  - Deprecate the published versions on npm and remove the trusted publisher.
  - Keep the release tags and GitHub releases of the package.

## 1.7.5

### Patch Changes

- 465d563: Document how to handle CodeQL code scanning alerts in
  `MAINTAINING.md`.

  - Fix findings in the code where possible, test code included.
  - Dismiss an alert only with a recorded exception and the same reason on
    GitHub.

- 465d563: Run the ESLint binary in the `eslint-config` runtime test without a
  shell.

  - Pass the arguments to `execFile()` instead of building a command string for
    `exec()`, so paths with spaces or shell characters keep working.
  - Resolve the CodeQL alert `js/shell-command-injection-from-environment`.

## 1.7.4

### Patch Changes

- 88677c6: Show the package identity validation in the release diagram of
  `README.md`.

  - Replace the "Package is Private?" gates in the GitHub release and publish
    workflows with the validation step that rejects private packages.

## 1.7.3

### Patch Changes

- f69acf7: Document how to handle Dependabot security alerts that cannot be
  fixed by an update.

  - Add a "Security Alerts" runbook to `MAINTAINING.md`.
  - Accept `minimatch` 10 (GHSA-g3hv-75wg-m249) until 2026-12-31, because
    `typedoc` still requires it.

## 1.7.2

### Patch Changes

- 989bb6c: Document that `main` accepts changes only through squash-merged pull
  requests.
- 989bb6c: Install dependencies with `pnpm/setup` instead of a separate workflow
  step.

  - Run the install in the setup step of the checks, docs, release, and GitHub
    release workflows, which caches the lockfile verification right after the
    install.
  - Require an existing lockfile with `require-lockfile: true`, which replaces
    `pnpm install --frozen-lockfile`.

- 989bb6c: Reject private packages when validating a release tag instead of
  skipping them.

  - Fail `scripts/release-package.js metadata` for private workspaces, so no job
    builds, packs, or downloads them.
  - Remove the skip steps and their conditions from the GitHub release and
    publish workflows.
  - Drop the `private` output and the duplicate check in
    `scripts/publish-release.js`.

## 1.7.1

### Patch Changes

- 9946fb0: Document recurring maintenance in runbooks.

  - Add `MAINTAINING.md` with runbooks for GitHub Actions updates, npm
    dependency updates, Node.js versions, contributor pull requests, releases
    and exceptions.
  - Point assistants to the runbooks in `AGENTS.md`.

- 9946fb0: Update development dependencies.

  - `@cspell/cspell-types` and `cspell` to ^10.5.2
  - `@vitest/coverage-v8`, `@vitest/ui` and `vitest` to ^5.1.1
  - `eslint` to ^10.15.0
  - `prettier` to ^3.10.1
  - `rollup` to ^4.68.7
  - `turbo` to ^2.11.13
  - Refresh the lockfile within the existing ranges.

- 9946fb0: Update GitHub Actions.

  - `actions/checkout` to v7.0.1
  - `actions/create-github-app-token` to v3.4.0
  - `peter-evans/repository-dispatch` to v4.0.1

- 9946fb0: Update pnpm to 12.21.0.
- 9946fb0: Set up pnpm and Node.js with `pnpm/setup` in all workflows.

  - Replace `pnpm/action-setup` and `actions/setup-node` with one `pnpm/setup`
    v3.2.0 step that reads pnpm from `packageManager` and Node.js from `.nvmrc`.
  - Keep the explicit install steps and the store cache where the workflows
    cached before; the publish workflow still runs without a cache.

## 1.7.0

### Minor Changes

- e2ae724: Enforce package layers with Turbo boundaries.

  - Tag every package as `config`, `core`, `lib`, `cli` or `meta` in its
    `turbo.json`.
  - Allow `config` packages to depend only on other `config` packages, and
    `core` packages on no internal runtime packages.
  - Prevent any package from depending on `cli` or `meta` packages.

- 8f0e0fe: Migrate the workflows to the published Simbo's Actions.

  - Get the app token with `actions/create-github-app-token` in the `release`
    environment, with `contents: write` only, and only in the release and GitHub
    release workflows.
  - Commit release bumps and create the release tags with
    `simbo-actions/signed-commit`, as a verified commit with lightweight tags.
  - Release the commit checked by the checks workflow, and fail if the branch
    has moved since then.
  - Create GitHub releases with `simbo-actions/staged-release`, without marking
    them as the latest release.
  - Use `GITHUB_TOKEN` for checks, the release dispatch, npm publishing, and the
    docs deployment.
  - Pin all actions by commit SHA, set minimal permissions per job, and keep
    checkout credentials out of the working tree.
  - Require pull requests to add a changeset instead of accepting any pending
    one, and drop the removed bundle step from the checks.

- 5d801cb: Simplify the repository tooling.

  - Format all packages from the repository root instead of per package.
  - Build the packages that root checks depend on through Turbo.
  - Lint and type-check the TypeDoc configuration.
  - Remove the unused `bundle` task and the duplicate `engine-strict` setting.
  - Configure changesets for public packages and tag private packages.
  - Pin pnpm with an integrity hash.

- 704a921: Accept Dependabot pull requests that only update workflows without a
  changeset.

  - Skip the changeset requirement when `dependabot[bot]` opened the pull
    request and it changes only files in `.github/workflows/`.
  - Keep requiring a changeset for every other pull request.

- 2c2dce2: Keep the pinned GitHub Actions up to date with Dependabot.

  - Check the actions in the workflows daily.
  - Group the own `simbo-actions/*` actions into one pull request, without a
    cooldown.
  - Open one pull request per update for all other actions, after a cooldown of
    7 days.

- 3982c1d: Use Node.js 26 for development.

  - `.nvmrc` follows the current Active LTS release.
  - Supported Node.js versions follow the Node.js release schedule, and
    `@types/node` follows the lowest supported major version.

### Patch Changes

- 47cf87f: Document when and how to write changesets.

  - Every change gets a changeset: a package changeset when the published
    package changes for its users, otherwise one for this changelog.
  - Each changeset covers one topic with a summary paragraph and lists its
    details.

- 3982c1d: Fix the findings of `eslint-plugin-unicorn` 79 in the repository
  code.

  - Write non-breaking spaces as escape sequences.
  - Simplify a ternary and narrow the scope of types in tests.
  - Remove `eslint-disable` comments that are no longer needed.

- d76a0e2: Stop recording sessions on the documentation pages.
- 492ac88: Update development dependencies.

  - `prettier` to ^3.10.0
  - `rollup` to ^4.68.2
  - `turbo` to ^2.11.11
  - `vite` to ^8.3.8

## 1.6.1

### Patch Changes

- 5f28099: Improve CI diagram rendering compatibility and document the trusted
  publisher's two-day validation deadline with an immediate patch release
  recommendation.

## 1.6.0

### Minor Changes

- 710ac4e: Build package archives once in the GitHub release workflow, then
  verify and publish the same release tarballs to npm. Decouple release creation
  from registry availability and document first publishes and retries using
  release assets.

  Add an interactive pnpm command to download, verify and publish release
  archives locally, including a read-only check mode and tests for invalid
  release assets.

  Keep repository helpers in scripts/ and run their tests through Vitest
  alongside package tests, with a dedicated scripts project for focused runs.

### Patch Changes

- 8e9dabc: Document pnpm 12 with the exact version maintained in package.json,
  and align the release diagram with the existing publish and GitHub release
  workflows.
- e235985: Update pnpm from 12.8.1 to 12.14.0 and development dependencies.
  Remove unused direct `baseline-browser-mapping` dependencies from workspace
  packages. Capture and assert expected release-helper success messages instead
  of printing test fixture output.

## 1.5.6

### Patch Changes

- 4fb4825: minor dependency upgrades
- 9f38803: Disable Turbo update notifications centrally in turbo.json for local
  runs and CI.

## 1.5.5

### Patch Changes

- 9b365b4: update/fix url schemas throughout the repo from http to https
- bf8d6e2: update umami tracking scripts for docs
- c68cba9: upgrade dependencies

## 1.5.4

### Patch Changes

- 1c58f82: cleanup tsconfig files and turbo.json tasks

## 1.5.3

### Patch Changes

- 2ded9ff: Update documentation links from `simbo.codes` to `simbo.de`. Refresh
  repository setup, build, test and publishing instructions, and align the
  documented CI flow with the current workflows.
- 2ded9ff: Upgrade the repository's test tooling to Vitest 5.0.1, including the
  V8 coverage provider and Vitest UI. Explicitly include source files in
  coverage reports, use automatic mock clearing and replace deprecated
  `toThrowError` assertions with `toThrow`.

## 1.5.2

### Patch Changes

- cf94f67: upgrade dependencies

## 1.5.1

### Patch Changes

- faa5cdc: upgrade dependencies

## 1.5.0

### Minor Changes

- f28ce20: upgrades:
  - setup trusted publishing for all packages
  - upgrade to nodejs 24 and npm 11
  - streamline scripts and workflows
  - update workflow events and triggers
  - update workflow naming and structure
  - remove pnpm catalogs setup
  - setup npm-check-updates
  - separate github release from publish workflow
  - update dependants only on minor version bumps when integrating changesets
  - use github app for credentials in workflows

## 1.4.8

### Patch Changes

- adedf36: upgrade dependencies

## 1.4.7

### Patch Changes

- 6457f71: update all eslint configs regarding changed exports for defineConfig
  and globalIgnores
- 6457f71: upgrade dependencies

## 1.4.6

### Patch Changes

- 7540366: improve dispatch events and outputs handling

## 1.4.5

### Patch Changes

- b5fbe82: update pnpm to 10.15.1

## 1.4.4

### Patch Changes

- eb60745: add packages-list script to preflight checks

## 1.4.3

### Patch Changes

- c999daf: combine dependency catalogs to the default catalog

## 1.4.2

### Patch Changes

- 3e6b3eb: automatically generate markdown list of packages
- 51cdb8a: improve vscode performance by setting `search.followSymlinks` to
  false
- ba94173: let docs build fail on warnings

## 1.4.1

### Patch Changes

- 8940463: precede docs build by global build and improve success message for
  preflight script

## 1.4.0

### Minor Changes

- 40384c9: setup turbo tasks for eslint and prettier
- 4bbebf1: setup prettier for all workspaces

### Patch Changes

- 62e9cbf: add `CHANGELOG.md` referring to the actual changelogs and update the
  readme

## 1.3.1

### Patch Changes

- 8009a80: fix var usage in docs workflow

## 1.3.0

### Minor Changes

- a221cdc: setup eslint for all packages

### Patch Changes

- db57144: enable unit tests in checks workflow
- deba441: add vitest configs to all workspaces

## 1.2.0

### Minor Changes

- 6378850: Added Docs Publishing and updated README files.

## 1.1.0

### Minor Changes

- 6c8d2c8: Repo setup changes:
  - rename repo from `simbos-configs` to `packages`
  - add vitest setup
  - set some pnpm options
  - create pnpm catalog entries for all dependencies
  - set typedoc router settings to 'kind-dir'
  - improve folder structure of `src` folders for all packages
  - remove deprecated `npm-check-updates` scripts from root package.json

## 1.0.0

### Major Changes

- fb86c78: Initial Release
