/**
 * Finds the workspaces whose version changed against a Git ref.
 *
 * Run from the repository root after `changeset version`:
 * `node scripts/version-bumps.js [base]` compares the `version` of every
 * workspace manifest in the working tree with the manifest at `base` (default
 * `HEAD`) and writes the outputs `packages` (JSON), `tags` (space-separated, as
 * signed-commit takes them) and `count` to GITHUB_OUTPUT. A manifest missing at
 * `base` counts as a bump. Finding no bump fails.
 *
 * Temporary: shaped like the planned simbo-actions/version-bumps action, which
 * will replace it. Requires Git and the built `@simbo/monorepo-utils`.
 */
import { execFile } from 'node:child_process';
import { appendFile } from 'node:fs/promises';
import { posix, resolve, sep } from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

// A relative import, because a root dependency on a library would break the Turbo boundaries.
import { readWorkspaces } from '../packages/monorepo-utils/dist/index.js';

const execFileAsync = promisify(execFile);

/**
 * A workspace whose version differs from the one at the base ref: package name,
 * workspace directory relative to the root with `/` separators, version at the
 * base ref (empty for a new workspace), version in the working tree, private
 * flag, and release tag `<name>/v<version>`. The keys match the outputs of the
 * planned action.
 *
 * @typedef {{name: string, dir: string, 'previous-version': string, version: string, private: boolean, tag: string}} VersionBump
 */

/**
 * Reads the version of a manifest at a Git ref.
 *
 * @param {string} root - Repository root.
 * @param {string} base - Git ref to read from.
 * @param {string} path - Manifest path relative to the root, with `/` separators.
 * @returns {Promise<string>} The version, or an empty string if the manifest does not exist at the ref.
 * @throws {Error} If the ref is invalid or the manifest at the ref has no string version.
 */
async function readVersionAt(root, base, path) {
  // ls-tree lists nothing for a missing path but fails for an invalid ref.
  const { stdout: listed } = await execFileAsync('git', ['ls-tree', '--name-only', base, '--', path], { cwd: root });
  if (listed.trim() === '') return '';
  const { stdout } = await execFileAsync('git', ['show', `${base}:${path}`], { cwd: root });
  /**
   * @type {unknown}
   */
  const manifest = JSON.parse(stdout);
  const version = typeof manifest === 'object' && manifest !== null && 'version' in manifest && manifest.version;
  if (typeof version !== 'string') throw new TypeError(`Invalid manifest at ${base}:${path}: version is required.`);
  return version;
}

/**
 * Compares every workspace manifest in the working tree with its state at `base`.
 *
 * @param {object} [options] - Comparison options.
 * @param {string} [options.base] - Git ref to compare against; defaults to `HEAD`.
 * @param {string} [options.root] - Repository root; defaults to the current directory.
 * @returns {Promise<VersionBump[]>} Bumped workspaces, sorted by name.
 * @throws {Error} If workspaces cannot be read or Git fails.
 */
export async function getVersionBumps({ base = 'HEAD', root = process.cwd() } = {}) {
  const workspaces = await readWorkspaces({ workingDir: root });
  const bumps = await Promise.all(
    workspaces.map(async workspace => {
      const dir = workspace.relativePath.split(sep).join(posix.sep);
      const previous = await readVersionAt(root, base, `${dir}/package.json`);
      if (previous === workspace.version) return;
      /**
       * @type {VersionBump}
       */
      const bump = {
        name: workspace.name,
        dir,
        'previous-version': previous,
        version: workspace.version,
        private: workspace.private,
        tag: `${workspace.name}/v${workspace.version}`,
      };
      return bump;
    }),
  );
  return bumps.filter(bump => bump !== undefined).toSorted((a, b) => a.name.localeCompare(b.name));
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  try {
    if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is required for workflow outputs.');
    const bumps = await getVersionBumps({ base: process.argv[2] || 'HEAD' });
    if (bumps.length === 0) throw new Error('No workspace version changed.');
    const tags = bumps.map(bump => bump.tag).join(' ');
    process.stdout.write(`🧾 Bumped: ${tags}\n`);
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `packages=${JSON.stringify(bumps)}\ntags=${tags}\ncount=${bumps.length}\n`,
    );
  } catch (error) {
    const message = (error instanceof Error ? error.message : String(error))
      .replaceAll('%', '%25')
      .replaceAll('\r', '%0D')
      .replaceAll('\n', '%0A');
    process.stderr.write(`::error title=Version Bumps Failed::${message}\n`);
    process.exitCode = 1;
  }
}
