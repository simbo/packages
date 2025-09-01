import { log } from 'node:console';
import { relative, resolve } from 'node:path';

import { UserFacingError } from '@simbo/user-facing-error';
import { cosmiconfig } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import { dim } from 'yoctocolors';

import { validateConfig, type Config, type ValidatedConfig } from './config-schema.js';

/**
 * Creates a config loader function for the monorepo packages list.
 *
 * @param monorepoRootPath - The absolute path to the monorepo root directory.
 * @returns A function that loads the configuration for a specific file path.
 */
export function createConfigLoader(monorepoRootPath: string): (filePath?: string) => Promise<ValidatedConfig> {
  const explorer = cosmiconfig('monorepo-packages-list', {
    searchStrategy: 'none',
    searchPlaces: [
      `monorepo-packages-list.config.ts`,
      `packages-list.config.ts`,
      `monorepo-packages-list.config.js`,
      `packages-list.config.js`,
    ],
    loaders: {
      '.ts': TypeScriptLoader(),
    },
    // Loaded configs are transformed by zod schema validation
    transform: result => {
      if (result?.config) {
        try {
          result.config = validateConfig(result.config as Config);
        } catch (error) {
          throw UserFacingError.from(
            error,
            `Failed to parse the config file: ./${relative(monorepoRootPath, result.filepath)}`,
          );
        }
      }
      return result;
    },
  });

  /**
   * Get the monorepo packages list configuration.
   *
   * @param filePath - The path to the specific configuration file. Defaults to a list of fallbacks.
   *
   * @returns The monorepo packages list configuration.
   */
  return async (filePath?: string): Promise<ValidatedConfig> => {
    const result = filePath
      ? await explorer.load(resolve(monorepoRootPath, filePath))
      : await explorer.search(monorepoRootPath);
    if (!result?.config) {
      log(dim(`No configuration file found, using default configuration.`));
      return validateConfig({});
    }
    log(dim(`Using configuration from ./${relative(monorepoRootPath, result.filepath)}`));
    return result.config as ValidatedConfig;
  };
}
