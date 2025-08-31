import { readWorkspaces } from '@simbo/monorepo-utils';

import type { Options } from './monorepo-packages-list.types.js';
import { validateOptions } from './options-schema.js';

/**
 * Generates a list of monorepo packages with metadata.
 *
 * @param options - The options to customize the package list.
 * @returns A list of monorepo packages with metadata.
 */
export async function monorepoPackagesList(options: Options = {}): Promise<string> {
  const { workingDir, templateFn, templateData, sortCompareFn, filterFn, before, after, delimiter } =
    validateOptions(options);

  const workspaces = (await readWorkspaces({ workingDir })).filter(workspace => filterFn(workspace));

  workspaces.sort(sortCompareFn);

  const listItems = await Promise.all(workspaces.map(async workspace => templateFn(workspace, templateData)));

  const list = listItems.join(delimiter);

  return [
    typeof before === 'function' ? await before(workspaces) : before,
    list,
    typeof after === 'function' ? await after(workspaces) : after,
  ].join('');
}
