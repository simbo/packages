import { readFile } from 'node:fs/promises';
import { basename, join, relative, resolve } from 'node:path';
import { cwd } from 'node:process';

import { readPackageJson } from '@simbo/package-json';
import { stringifyError } from '@simbo/stringify-error';
import type { PackageJson } from 'type-fest';

import type { ValidatedPackageJson, WorkspaceMetadata } from './monorepo-utils.types.js';

/**
 * Options for getting workspace metadata.
 */
export interface GetWorkspaceMetadataOptions {
  /**
   * The working directory to get the workspace metadata from.
   * Should be the path to the root of the repository.
   * Defaults to the current working directory.
   *
   * @default process.cwd()
   */
  workingDir?: string;
}

/**
 * Get metadata for a workspace.
 *
 * @param workspacePath - The path to the workspace to get metadata for. Should be
 * the path to the directory containing the package.json file. Can be a relative
 * or absolute path.
 * @param options - Options for getting workspace metadata.
 * @returns The metadata for the workspace.
 */
export async function getWorkspaceMetadata(
  workspacePath: string,
  options: GetWorkspaceMetadataOptions = {},
): Promise<WorkspaceMetadata> {
  const { workingDir = cwd() } = options;

  const absolutePath = resolve(workingDir, workspacePath);
  const relativePath = relative(workingDir, absolutePath);
  const folderName = basename(absolutePath);

  const { packageJson, name, version, description } = await aggregatePackageJsonData(absolutePath, relativePath);

  const { readme, title } = await aggregateReadmeData(absolutePath, relativePath);

  return {
    name,
    version,
    description,
    private: !!packageJson.private,
    relativePath,
    absolutePath,
    folderName,
    packageJson,
    readme,
    title,
  };
}

/**
 * Aggregates data from the package.json file.
 *
 * @param absolutePath - The absolute path to the workspace.
 * @param relativePath - The relative path to the workspace.
 * @returns The aggregated package.json data.
 */
async function aggregatePackageJsonData(
  absolutePath: string,
  relativePath: string,
): Promise<{ packageJson: ValidatedPackageJson; name: string; version: string; description: string }> {
  const unvalidated = await readPackageJson(absolutePath);

  const fields: (keyof PackageJson)[] = ['name', 'version', 'description'];

  for (const field of fields) {
    if (typeof unvalidated[field] !== 'string' || unvalidated[field].trim() === '') {
      throw new Error(`Invalid package.json at ${relativePath}: ${field} is required`);
    }
  }

  const packageJson = unvalidated as ValidatedPackageJson;
  const { name, version, description } = packageJson;

  return { packageJson, name, version, description };
}

/**
 * Aggregates data from the README.md file.
 *
 * @param absolutePath - The absolute path to the workspace.
 * @param relativePath - The relative path to the workspace.
 * @returns The aggregated README data.
 */
async function aggregateReadmeData(
  absolutePath: string,
  relativePath: string,
): Promise<{ readme: string; title: string }> {
  let readme: string | undefined;
  let title: string | undefined;

  try {
    readme = await readFile(join(absolutePath, 'README.md'), 'utf8');
    title = /^#\s+(.+)$/m.exec(readme)?.[1].trim();
  } catch (error) {
    throw new Error(`Failed to read README.md at ${relativePath}: ${stringifyError(error)}`, { cause: error });
  }

  if (typeof title !== 'string' || title.length === 0) {
    throw new Error(`Failed to extract the title from README.md at ${relativePath}.`);
  }

  return { readme, title };
}
