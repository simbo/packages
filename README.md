# 📦 Simbo's Packages

> A monorepo for my npm packages.

## Packages

<!-- PACKAGES -->

There are currently _**30**_ packages managed in this repository.

<!-- /PACKAGES -->

See the [`PACKAGES.md`](https://github.com/simbo/packages/blob/main/PACKAGES.md)
for a comprehensive list of all packages.

## Package Requirements

All packages require Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`. Node.js 20 is
no longer supported. See individual package READMEs for peer dependencies and
configuration requirements.

## Development

### Requirements

- a linux-based operating system
- Node.js 24.21.0 (see `.nvmrc`) via [nvm](https://github.com/nvm-sh/nvm)
- [pnpm](https://pnpm.io/) 12 (see `packageManager` in `package.json` for the
  exact version)

### Setup

```bash
git clone git@github.com:simbo/packages.git
cd packages
nvm install
pnpm install
pnpm run each:build
```

### Toolset

- Repository Management
  - [pnpm](https://pnpm.io/)
  - [Turborepo](https://turbo.build/)
  - [Changesets](https://github.com/changesets/changesets#readme)
  - [Commitlint](https://commitlint.js.org/)

- Documentation
  - [TypeDoc](https://typedoc.org/)

- Testing and Quality Control
  - [Vitest](https://vitest.dev/)
  - [ESLint](https://eslint.org/)
  - [Prettier](https://prettier.io/)
  - [CSpell](https://cspell.org/)

### Usage

#### Building

```bash
# build all packages
pnpm run each:build

# build a package
pnpm run each:build --filter=<TURBO_SELECTOR>
```

#### Dependencies

```bash
# install dependencies for all workspaces
pnpm install

# add a dependency to a workspace
pnpm add --filter=<PNPM_SELECTOR> [-D] <DEPENDENCY>

# remove a dependency from a workspace
pnpm remove --filter=<PNPM_SELECTOR> <DEPENDENCY>

# interactively update dependency versions
pnpm update --recursive --interactive --latest
```

#### Tests

```bash
# run all tests for all packages
pnpm run test
# or for a specific package
pnpm run --filter=<PNPM_SELECTOR> test

# run tests in watch mode
pnpm run [--filter=<PNPM_SELECTOR>] test:watch

# run tests in ui mode
pnpm run [--filter=<PNPM_SELECTOR>] test:ui

# run repository helper script tests
pnpm run test --project scripts
```

Vitest 5 clears mock call history before each test. Coverage includes all source
files selected by `coverage.include`, including untested files. To open the test
UI, use the URL containing the authentication token printed by Vitest.

#### Checks

```bash
# run all possible checks, builds, and tests
pnpm run preflight

# run checks for all packages
pnpm run each:check

# run repository-level checks
pnpm run check

# prettier
pnpm run [--filter=<PNPM_SELECTOR>] check:format
pnpm run [--filter=<PNPM_SELECTOR>] fix:format

# eslint
pnpm run [--filter=<PNPM_SELECTOR>] check:eslint
pnpm run [--filter=<PNPM_SELECTOR>] fix:eslint

# cspell
pnpm run check:spelling

# types
pnpm run [--filter=<PNPM_SELECTOR>] check:types

# workspace boundaries
pnpm run check:boundaries
```

#### Docs

```bash
# generate API docs for all packages using typedoc
pnpm run docs

# serve the documentation locally
pnpm run serve:docs
```

### Releases

Adding changesets to the main branch will automatically create releases for the
affected packages. Each package is built and packed once for its GitHub release;
the npm publishing workflow verifies and uploads that same archive. See
[NPM_PUBLISHING.md](./NPM_PUBLISHING.md) for first publishes and retries.

#### Continuous Integration Flow

```mermaid
---
config:
  look: classic
  htmlLabels: false
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"'
  fontSize: 16
  flowchart:
    wrappingWidth: 400
    nodeSpacing: 30
    rankSpacing: 40
---
flowchart LR

  subgraph ChecksWorkflow[".github/workflows/checks.yml"]
    PushToMain@{ shape: rounded, label: "📥 Pushed to Main" }
    BuildPackages["👷 Build Packages"]
    RunTests["👨‍🔬 Run Tests"]
    RunChecks["👨‍🏫 Run Checks"]
    BuildDocs["📘 Build Docs"]
    ChecksPassed{"✅ All Checks<br>Passed?"}
    Changesets{"📄 Changesets<br>Present?"}
    ReleaseEventDispatch["🎉 Dispatch<br>Release Workflow"]

    direction TB
    PushToMain --> BuildPackages
    BuildPackages --> RunTests
    RunTests --> RunChecks
    RunChecks --> BuildDocs
    BuildDocs --> ChecksPassed
    ChecksPassed --"YES"--> Changesets
    Changesets --"YES"--> ReleaseEventDispatch
  end

  subgraph ReleaseWorkflow[".github/workflows/release.yml"]
    ReleaseEvent@{ shape: rounded, label: "🎉 Release Workflow<br>Requested" }
    IntegrateChangesets["🔄 Apply Changesets<br>and Sync Versions"]
    CollectPackages["🧾 Find Changed<br>Packages"]
    UpdatePackageDocs["📝 Update<br>Package Lists"]
    CommitAndPushChanges["💾 Commit and<br>Push Changes"]
    PushReleaseTags["🏷️ Push Release Tags<br>for Bumped Packages<br>PACKAGE/vVERSION"]

    direction TB
    ReleaseEvent --> IntegrateChangesets
    IntegrateChangesets --> CollectPackages
    CollectPackages --> UpdatePackageDocs
    UpdatePackageDocs --> CommitAndPushChanges
    CommitAndPushChanges --> PushReleaseTags
  end

  subgraph GitHubReleaseWorkflow[".github/workflows/github-release.yml"]
    TagEvent@{ shape: rounded, label: "🏷️ Tag Pushed<br>PACKAGE/vVERSION" }
    IsReleasePrivate{"Package is<br>Private?"}
    BuildPackage["👷 Build Tagged<br>Package"]
    PackTarball["📦 Prepare Tarball<br>with Checksum"]
    ExtractChangelogEntry["📝 Extract<br>Changelog Entry"]
    UploadDraft["🎁 Create Draft Release<br>and Upload Assets"]
    PublishRelease["🚀 Publish Final Release<br>with Tarball<br>and Checksum"]

    direction TB
    TagEvent --> IsReleasePrivate
    IsReleasePrivate --"NO"--> BuildPackage
    BuildPackage --> PackTarball
    PackTarball --> ExtractChangelogEntry
    ExtractChangelogEntry --> UploadDraft
    UploadDraft --> PublishRelease
  end

  subgraph PublishWorkflow[".github/workflows/publish.yml"]
    ReleasePublished@{ shape: rounded, label: "🎉 GitHub Release<br>Published" }
    DownloadArchive["📥 Fetch Release Tarball<br>with Checksum"]
    VerifyDownload["🔐 Verify Identity<br>and Checksum"]
    IsPrivate{"Package is<br>Private?"}
    PublishToNpm["🚛 Publish Tarball<br>to NPM"]

    direction TB
    ReleasePublished --> IsPrivate
    IsPrivate --"NO"--> DownloadArchive
    DownloadArchive --> VerifyDownload
    VerifyDownload --> PublishToNpm
  end

  ChecksWorkflow Link1@=== ReleaseWorkflow
  ReleaseWorkflow Link2@=== GitHubReleaseWorkflow
  GitHubReleaseWorkflow Link3@=== PublishWorkflow

  linkStyle default stroke:#888888,stroke-width:1.5px;

  classDef animateLink stroke: #888888,stroke-dasharray:9,5,stroke-dashoffset:900, animation: dash 25s linear infinite;
  class Link1,Link2,Link3 animateLink

  classDef workflow stroke:#888888,fill:transparent,font-size:12px;
  class ChecksWorkflow,ReleaseWorkflow,GitHubReleaseWorkflow,PublishWorkflow workflow

  classDef event stroke:#B54BC8,stroke-width:2px,fill:transparent;
  class PushToMain,TagEvent,ReleaseEvent,ReleasePublished event

  classDef step stroke:#6366F1,stroke-width:2px,fill:transparent;
  class BuildPackages,RunTests,RunChecks,BuildDocs,ReleaseEventDispatch,IntegrateChangesets,CollectPackages,UpdatePackageDocs,CommitAndPushChanges,PushReleaseTags,BuildPackage,PackTarball,ExtractChangelogEntry,UploadDraft,PublishRelease,DownloadArchive,VerifyDownload,PublishToNpm step

  classDef gate stroke:#E67E22,stroke-width:2px,fill:transparent
  class IsReleasePrivate,IsPrivate,ChecksPassed,Changesets gate

```

## License

[MIT © Simon Lepel](https://simbo.mit-license.org/2025/)
