import { cwd, env } from 'node:process';

import { stringifyError } from '@simbo/stringify-error';
import pMap, { pMapSkip } from 'p-map';

import { getMonorepo } from './get-monorepo.js';
import { getWorkspaceMetadata } from './get-workspace-metadata.js';
import type { WorkspaceMetadata } from './monorepo-utils.types.js';

/**
 * Options for reading workspaces.
 */
export interface ReadWorkspacesOptions {
  /**
   * A directory inside the monorepo; the root is searched from there.
   * Defaults to the current working directory.
   *
   * @default process.cwd()
   */
  workingDir?: string;

  /**
   * The number of workspaces to read at the same time: a positive integer or `Infinity`.
   * If not specified, it will default to 10 in non-CI environments and 5 in CI environments.
   *
   * @default process.env.CI ? 5 : 10
   */
  concurrency?: number;
}

const CONCURRENCY = 10;
const CONCURRENCY_CI = 5;

/**
 * Read the metadata of all workspaces of the monorepo, sorted by path.
 *
 * The workspaces are read concurrently with `p-map`. All workspaces are read,
 * and every one that fails is reported.
 *
 * @param options - Options for reading workspaces.
 * @returns - An array of workspace metadata.
 * @throws {Error} If no monorepo is found, `concurrency` is invalid, or a workspace cannot be read.
 */
export async function readWorkspaces(options: ReadWorkspacesOptions = {}): Promise<WorkspaceMetadata[]> {
  const { workingDir = cwd(), concurrency = env.CI ? CONCURRENCY_CI : CONCURRENCY } = options;

  const { rootDir, packages } = await getMonorepo(workingDir);

  const errors: [string, unknown][] = [];

  const workspaces = await pMap(
    packages,
    async ({ relativeDir }) => {
      try {
        return await getWorkspaceMetadata(relativeDir, { workingDir: rootDir });
      } catch (error) {
        errors.push([relativeDir, error]);
        return pMapSkip;
      }
    },
    { concurrency },
  );

  if (errors.length > 0) {
    throw new Error(
      `Failed to read workspace${errors.length > 1 ? 's' : ''}: ${errors
        .map(([path, error]) => `${path} (${stringifyError(error)})`)
        .join(', ')}`,
    );
  }

  return workspaces;
}
