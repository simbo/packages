# Publishing Packages to NPM

Notes on publishing packages from this monorepo to the npm registry.

## Trusted Publishing

The npm registry requires _OIDC Trusted Publication_ for publishing packages.

📘
[npm Docs: Trusted publishing for npm packages](https://docs.npmjs.com/trusted-publishers)

Trusted publishing requires `npm >= 11.5.1` (`nodejs >= 24.5.0`).

Once a package has been published manually, subsequent releases can be done via
the automated GitHub workflows.

## First Time Publishing (Locally, Manually)

Release the package as usual by pushing changesets to main and let the CI create
a version tag. The publishing workflow will fail since the package is not yet
published.

Then, publish the package manually for the first time:

```bash
# checkout the version tag to publish
git checkout tags/PACKAGE_NAME/vX.Y.Z

# run preflight checks
pnpm run preflight

# build the package
pnpm exec turbo run build --filter=PACKAGE_NAME

# go to the package directory
cd packages/PACKAGE_WORKSPACE

# login to npm
npm login
# publish the package
npm publish --access public

# login to github.com
gh auth login
# dispatch a repository event to trigger post-publish actions
gh api repos/simbo/packages/dispatches \
  --method POST \
  -f 'event_type=package-published' \
  -f 'client_payload[name]=PACKAGE_NAME' \
  -f 'client_payload[version]=PACKAGE_VERSION'
```

## Configure a Package for Trusted Publishing

After the first time publishing a package, set up trusted publishing for
automated releases:

1. Go to the package settings on the npm website.

   ```plaintext
   https://www.npmjs.com/package/PACKAGE_NAME/access
   ```

2. Under _Trusted Publisher_, select "GitHub Actions" and set these options:
   - Organization or user:
     ```plaintext
     simbo
     ```
   - Repository:
     ```plaintext
     packages
     ```
   - Workflow filename:
     ```plaintext
     publish.yml
     ```

3. Click "Set up connection".

After confirming with 2FA, the settings should be displayed as configured.

The package should now be automatically published by the GitHub workflow.
