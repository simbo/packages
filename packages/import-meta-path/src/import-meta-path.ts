import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ImportMetaObject {
  dirname?: ImportMeta['dirname'];
  filename?: ImportMeta['filename'];
  url: ImportMeta['url'];
}

/**
 * Deriving absolute directory or file path from import.meta with a consistent fallback order.
 *
 * This function is Node.js-only and expects the `url` property to be a `file:` URL.
 *
 * For type `'dir'`, the fallback order is:
 *   1. `importMeta.dirname` (if present)
 *   2. `dirname(importMeta.filename)` (if present)
 *   3. `dirname(fileURLToPath(importMeta.url))`
 *
 * For type `'file'`, the fallback order is:
 *   1. `importMeta.filename` (if present)
 *   2. `fileURLToPath(importMeta.url)`
 *
 * @param importMeta -  An object resembling `import.meta`, containing at least a `url` property as a `file:` URL.
 * @param type - The type of path to retrieve: `'dir'` for directory or `'file'` for file path. Defaults to `'dir'`.
 * @returns The derived directory or file path as a string.
 * @throws {TypeError} If the `type` argument is not `'dir'` or `'file'`.
 */
export function importMetaPath(importMeta: ImportMetaObject, type: 'dir' | 'file' = 'dir'): string {
  switch (type) {
    case 'dir': {
      if (importMeta.dirname) {
        return importMeta.dirname;
      }
      if (importMeta.filename) {
        return dirname(importMeta.filename);
      }
      return dirname(fileURLToPath(importMeta.url));
    }
    case 'file': {
      if (importMeta.filename) {
        return importMeta.filename;
      }
      return fileURLToPath(importMeta.url);
    }
    default: {
      throw new TypeError(`Unknown Type: ${String(type)}`);
    }
  }
}
