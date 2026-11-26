# Publishing Packages to npm

## Release Pipeline

```text
<name>/v<version>
  → github-release.yml: build → pack → verify → upload draft assets → publish release
  → publish.yml: download → verify → publish the same .tgz to npm, unless private
```

The tag carries the full package name, scope included, for example
`@simbo/eslint-config/v3.4.0` or `packages-changelog/v1.8.0`. Every workspace
gets a GitHub release, private ones included. The release contains the archive
as `pnpm pack` names it (`simbo-eslint-config-3.4.0.tgz`) and `SHA256SUMS`;
releases created before this format keep their asset names. Only
`packages-changelog` releases become the latest release. The publish workflow
skips archives whose packed manifest is private. The package is built once.
Publishing never rebuilds or repacks it. GitHub's automatic source ZIP/tar
archives are not the npm package.

A GitHub release can exist before npm makes the version installable. An npm
failure does not remove the release. Both workflows support manual runs with
`name` and `version`; the tag must exist and contain the workflow tooling.
Published releases are preserved; incomplete drafts can be retried.

Tags from before the current format were moved to it on existing commits. Their
checkouts contain the older scripts, which do not accept the new tag format, so
those releases cannot be rerun or retried through the workflows.

## First Publish: Use the Release Tarball

Requirements: pnpm 12, the repository's Node.js version, GitHub CLI, and `tar`.
Run from this repository; the checkout does not need to match the release tag.
Use a reviewed, tested release. The initial CI publish may fail until trusted
publishing is configured.

Authenticate once:

```bash
gh auth login
pnpm login --registry https://registry.npmjs.org/
```

Replace `<name>/v<version>` with the release tag:

```bash
pnpm run publish-initial -- '<name>/v<version>'
```

The helper downloads the published release, verifies SHA-256 and that the packed
manifest matches the tag, refuses private packages, and shows the package,
version, registry and file. Confirm with `y` to publish that exact archive
through pnpm. Login and 2FA stay interactive. No checkout, build, repack, or
repository dispatch is needed. Downloaded files remain in a temporary directory
for inspection or recovery.

Check and download without publishing:

```bash
pnpm run publish-initial -- --check '<name>/v<version>'
```

Do not upload the version again while npm processes an accepted publish.

## Trusted Publishing

After the first publish, open the package's npm settings and add a GitHub
Actions trusted publisher:

| Field                | Value         |
| -------------------- | ------------- |
| Organization or user | `simbo`       |
| Repository           | `packages`    |
| Workflow filename    | `publish.yml` |
| Environment          | Leave empty   |

Allow direct publishing (`npm publish`) in the publisher configuration. Confirm
with 2FA. The workflow uses OIDC (`id-token: write`), GitHub-hosted runners, and
pnpm 12 from `packageManager`; no npm publish token is required. Keep provenance
enabled for public packages from the public repository.

Complete the first successful CI publish within **2 days** of creating the
trusted publisher, or the configuration expires. Prefer releasing immediately:
add a patch changeset for the package to validate automated npm publishing; no
runtime changes are needed. If the configuration expires, delete and recreate it
before retrying.

[Trusted publishing reference](https://docs.npmjs.com/trusted-publishers/)

## Retry npm Publishing

Use the existing GitHub release and the same archive. Fix authentication or
configuration errors first; check whether npm already accepted the version. Do
not overwrite release assets or rebuild the package to retry.

```bash
gh workflow run publish.yml --repo simbo/packages \
  -f name='<name>' -f version='<version>'
```

The workflow requires a published stable release, checks its identity and
SHA-256 digest, and publishes the verified tarball. Registry acceptance and
installation availability are separate states.
