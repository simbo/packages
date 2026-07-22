import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { cwd } from 'node:process';

import { isReadableFile } from '@simbo/accessible';
import { stringifyError } from '@simbo/stringify-error';

import * as yaml from 'yaml'

/**
 * Options for getting workspace patterns.
 */
export interface GetWorkspacePatternsOptions {
  /**
   * The working directory to get the workspace patterns from.
   * Defaults to the current working directory.
   *
   * @default process.cwd()
   */
  workingDir?: string;
}

/**
 * Enum for workspace configuration files.
 */
enum WorkspaceConfigFile {
  PnpmWorkspace = 'pnpm-workspace.yaml',
  PackageJson = 'package.json',
}

/**
 * Get the workspaces patterns from the specified working directory.
 *
 * Assuming the given working directory is a monorepo, this function will return
 * the patterns for all workspaces defined for the monorepo.
 *
 * If it finds workspaces defined in one of these places, it will return them
 * and look no further:
 * - in `./pnpm-workspace.yaml` file at `packages`
 * - in `./package.json` files at `workspaces`
 *
 * The found patterns are not trimmed and filtered for empty strings.
 * Beyond that, they are not parsed or validated in any way.
 *
 * @param options - The options for getting workspace patterns.
 * @returns An array of workspace patterns.
 * @throws {Error} If no configuration files are found, configurations didn't
 * provide any patterns or if there is an error reading the configuration files.
 */
export async function getWorkspacePatterns(options: GetWorkspacePatternsOptions = {}): Promise<string[]> {
  const { workingDir = cwd() } = options;

  const patterns: string[] = [];

  for (const file of Object.values(WorkspaceConfigFile)) {
    patterns.push(...(await readWorkspaceConfig(workingDir, file)));
    if (patterns.length > 0) {
      break;
    }
  }

  if (patterns.length === 0) {
    throw new Error(`No configuration files found in ${workingDir}`);
  }

  return patterns;
}

/**
 * Reads the workspace configuration from a file.
 *
 * @param path - The path to the directory containing the configuration file.
 * @param file - The name of the configuration file.
 * @returns An array of workspace patterns.
 * @throws {Error} If there is an error reading the configuration file or if no
 * patterns are found although the file exists.
 */
async function readWorkspaceConfig(path: string, file: WorkspaceConfigFile): Promise<string[]> {
  const filePath = join(path, file);

  const patterns: string[] = [];

  if (!(await isReadableFile(filePath))) {
    return patterns;
  }

  try {
    const fileContent = await readFile(filePath, 'utf8');

    let workspacesOption: unknown;

    switch (file) {
      case WorkspaceConfigFile.PnpmWorkspace: {
        workspacesOption = yaml.parse(fileContent).packages;
        break;
      }
      case WorkspaceConfigFile.PackageJson:
      default: {
        workspacesOption = (JSON.parse(fileContent) as { workspaces?: unknown }).workspaces;
        break;
      }
    }

    patterns.push(...filterWorkspacesOptions(workspacesOption));
  } catch (error) {
    throw new Error(`Error reading ${relative(path, filePath)}: ${stringifyError(error)}`, { cause: error });
  }

  if (patterns.length === 0) {
    throw new Error(`No workspace patterns found in ${relative(path, filePath)}`);
  }

  return patterns;
}

/**
 * Filters the workspace options.
 *
 * @param option - The workspace options to filter.
 * @returns An array of filtered workspace patterns.
 */
function filterWorkspacesOptions(option: unknown): string[] {
  const patterns: string[] = [];
  if (!Array.isArray(option)) {
    return patterns;
  }
  for (const item of option) {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed) {
        patterns.push(trimmed);
      }
    }
  }
  return patterns;
}
