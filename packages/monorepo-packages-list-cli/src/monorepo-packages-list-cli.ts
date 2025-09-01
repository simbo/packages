import { log } from 'node:console';
import { readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { cwd } from 'node:process';

import { isWritableFile } from '@simbo/accessible';
import { callPrettier } from '@simbo/call-prettier';
import { success } from '@simbo/cli-output';
import { clirk } from '@simbo/clirk';
import { findGitRepositoryRoot } from '@simbo/find-git-repository-root';
import { injectBetweenHtmlComments } from '@simbo/inject-between-html-comments';
import { monorepoPackagesList } from '@simbo/monorepo-packages-list';
import { UserFacingError } from '@simbo/user-facing-error';
import { dim } from 'yoctocolors';

import { validateArgs } from './args-schema.js';
import { CLI_CONFIG } from './cli-config.js';
import { createConfigLoader } from './config-loader.js';

/**
 * The main entry point for the Monorepo Packages List CLI.
 *
 * @param workingDir - The working directory to use.
 */
export async function monorepoPackagesListCli(workingDir = cwd()): Promise<void> {
  const { args } = await clirk(CLI_CONFIG);
  const { configFile, targetFiles } = validateArgs(args);

  // Determine the monorepo root path
  const monorepoRootPath = await findGitRepositoryRoot(workingDir);

  // Fail if the monorepo root path is not found
  if (!monorepoRootPath) {
    throw new UserFacingError(`Monorepo root not found starting from: ${workingDir}`, true);
  }

  // Read the config file
  const loadConfig = createConfigLoader(monorepoRootPath);
  const configs = await loadConfig(configFile);

  for (const [i, config] of configs.entries()) {
    // Determine the target file
    const targetFile = typeof targetFiles[i] === 'string' ? targetFiles[i] : config.targetFile;
    const targetAbsPath = resolve(monorepoRootPath, targetFile);
    const targetRelPath = relative(monorepoRootPath, targetAbsPath);

    // Check if the target file is writable
    if (!(await isWritableFile(targetAbsPath))) {
      throw new UserFacingError(`File is not writable: ${targetRelPath}`, true);
    }

    // Read the file content
    const fileContent = await readFile(targetAbsPath, 'utf8');

    // Generate the packages list
    const options = Object.fromEntries(Object.entries(config).filter(([key]) => key !== 'targetFile'));
    const packagesList = await monorepoPackagesList({ ...options, workingDir: monorepoRootPath });

    // Inject the packages list into the file content
    const updatedContent = injectBetweenHtmlComments(fileContent, packagesList, { text: 'PACKAGES' });

    // Write the updated content back to the file
    await writeFile(targetAbsPath, updatedContent, 'utf8');

    // Format the updated file
    await callPrettier(targetRelPath, { workingDir: monorepoRootPath });

    // Log success message
    log(success(`Monorepo packages list updated. ${dim(`(${targetRelPath})`)}`));
  }
}
