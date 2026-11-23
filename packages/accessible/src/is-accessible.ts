import { access, constants, stat } from 'node:fs/promises';

const ACCESS_MODE_FLAGS = {
  r: constants.R_OK,
  w: constants.W_OK,
  x: constants.X_OK,
};

/**
 * Check if a file or directory is accessible with the given modes.
 *
 * Modes can be a combination of 'r', 'w', and 'x'.
 *
 * @param type - The type of the path ('file' or 'directory').
 * @param modes - The access modes to check ('r', 'w', 'x' or a combination).
 * @param path - The path to check.
 * @returns A promised boolean indicating if the path is accessible.
 */
export async function isAccessible(type: 'file' | 'directory', modes: string, path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    if ((type === 'file' && !stats.isFile()) || (type === 'directory' && !stats.isDirectory())) {
      return false;
    }

    const modeRegex = new RegExp(`[^${Object.keys(ACCESS_MODE_FLAGS).join('')}]+`, 'g');
    const modeFlags = new Set(modes.replaceAll(modeRegex, ''));

    for (const [flag, mode] of Object.entries(ACCESS_MODE_FLAGS)) {
      if (modeFlags.has(flag)) {
        try {
          await access(path, mode);
        } catch {
          return false;
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}
