import { cwd, env } from 'node:process';

import { stringifyError } from '@simbo/stringify-error';
import Queue from 'p-queue';

import { getWorkspaceMetadata } from './get-workspace-metadata.js';
import { getWorkspacePaths } from './get-workspace-paths.js';
import type { WorkspaceMetadata } from './monorepo-utils.types.js';

/**
 * Options for reading workspaces.
 */
export interface ReadWorkspacesOptions {
  /**
   * The working directory to get the workspace metadata from.
   * Should be the path to the root of the repository.
   * Defaults to the current working directory.
   *
   * @default process.cwd()
   */
  workingDir?: string;

  /**
   * The concurrency level for reading workspaces.
   * If not specified, it will default to 10 in non-CI environments and 5 in CI environments.
   *
   * @default process.env.CI ? 5 : 10
   */
  concurrency?: number;
}

const CONCURRENCY = 10;
const CONCURRENCY_CI = 5;

/**
 * Read workspace metadata from the file system.
 *
 * A queue (p-queue) is used to manage concurrent file system operations.
 *
 * @param options - Options for reading workspaces.
 * @returns - An array of workspace metadata.
 */
export async function readWorkspaces(options: ReadWorkspacesOptions = {}): Promise<WorkspaceMetadata[]> {
  const { workingDir = cwd(), concurrency = env.CI ? CONCURRENCY_CI : CONCURRENCY } = options;

  if (typeof concurrency !== 'number' || concurrency <= 0) {
    throw new TypeError('Concurrency must be a positive number');
  }

  const workspacesPaths = await getWorkspacePaths({ workingDir });

  const workspaces: WorkspaceMetadata[] = [];
  const queueErrors = new Map<string, unknown>();

  const queue = new Queue({ concurrency });

  const enqueue = (workspacePath: string): void => {
    queue
      .add(async () => {
        const data = await getWorkspaceMetadata(workspacePath, { workingDir });
        workspaces.push(data);
      })
      .catch((error: unknown) => {
        queueErrors.set(workspacePath, error);
        queue.clear();
      });
  };

  for (const workspacePath of workspacesPaths) {
    enqueue(workspacePath);
  }

  await queue.onIdle();

  if (queueErrors.size > 0) {
    throw new Error(
      `Failed to read workspace${queueErrors.size > 1 ? 's' : ''}: ${[...queueErrors]
        .map(([path, error]) => `${path} (${stringifyError(error)})`)
        .join(', ')}`,
    );
  }

  return workspaces;
}
