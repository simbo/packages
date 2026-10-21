# Publishing Packages to npm

## Release Pipeline

```text
<workspace>/v<version>
  → github-release.yml: build → pack → verify → upload draft assets → publish release
  → publish.yml: download → verify → publish the same .tgz to npm
```

The GitHub release contains `<workspace>-<version>.tgz` and `SHA256SUMS`. The
package is built once. Publishing never rebuilds or repacks it. GitHub's
automatic source ZIP/tar archives are not the npm package.

A GitHub release can exist before npm makes the version installable. An npm
failure does not remove the release. Both workflows support manual runs with
`workspace` and `version`; the tag must exist and contain the workflow tooling.
Published releases are preserved; incomplete drafts can be retried.

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

Replace `<workspace>/v<version>` with the release tag:

```bash
pnpm run publish-initial -- '<workspace>/v<version>'
```

The helper downloads the published release, reads its tagged manifest, verifies
SHA-256 and package identity, and shows the package, version, registry and file.
Confirm with `y` to publish that exact archive through pnpm. Login and 2FA stay
interactive. No checkout, build, repack, or repository dispatch is needed.
Downloaded files remain in a temporary directory for inspection or recovery.

Check and download without publishing:

```bash
pnpm run publish-initial -- --check '<workspace>/v<version>'
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

[Trusted publishing reference](https://docs.npmjs.com/trusted-publishers/)

## Retry npm Publishing

Use the existing GitHub release and the same archive. Fix authentication or
configuration errors first; check whether npm already accepted the version. Do
not overwrite release assets or rebuild the package to retry.

```bash
gh workflow run publish.yml --repo simbo/packages \
  -f workspace='<workspace>' -f version='<version>'
```

The workflow requires a published stable release, checks its identity and
SHA-256 digest, and publishes the verified tarball. Registry acceptance and
installation availability are separate states.
