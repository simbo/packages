/**
 * Integrates trusted Nunjucks filesystem templates with Vite's HTML pipeline.
 * Each render owns its environment; only development client environments retain
 * dependency paths for reloads. This module does not provide template isolation.
 */
import { readFile } from 'node:fs/promises';
import { basename, dirname, resolve as resolvePath } from 'node:path';
import { callbackify } from 'node:util';

import { Environment, Template, type ConfigureOptions, type ILoaderAsync, type Loader } from 'nunjucks';
import { normalizePath, type DevEnvironment, type Plugin } from 'vite';

/**
 * Inputs for rendering Nunjucks expressions and template files during Vite processing.
 */
export interface NunjucksPluginOptions {
  /**
   * Overrides Nunjucks defaults: escape HTML, reject undefined output, trim block
   * whitespace, and read included templates without caching their compiled form.
   */
  options?: ConfigureOptions;

  /**
   * Registers filters, globals or extensions on each new render environment.
   * Called before compilation; thrown errors reject the HTML transform.
   * Use Nunjucks' callback API when registering asynchronous filters.
   */
  configureEnvironment?: (environment: Environment) => void | Promise<void>;

  /**
   * Variables available to every HTML entry. An object under a page basename adds
   * or overrides variables for that page, e.g. 'index.html': { title: 'Home' }.
   * Matching uses the basename only, so pages in different folders with the same
   * filename share these overrides.
   */
  locals?: Record<string, unknown>;
}

/**
 * Renders HTML before Vite processes it and reloads pages when included templates change.
 *
 * Vite does not evaluate Nunjucks expressions such as {{ siteName }} on
 * its own. Register this plugin with the locals needed by the HTML entry to
 * replace those expressions and load included template files during development
 * and production builds. It reads trusted templates from the filesystem and
 * uses Vite's watcher to reload the page when an included file changes.
 * Plain include names start from the HTML entry directory; ./ and ../ paths start
 * from the containing template's directory. Each HTML render uses a new Nunjucks
 * environment so templates from different entries cannot share loader state.
 * Includes and layouts are read asynchronously and registered with Vite's watcher,
 * including files outside the root. Requested paths are tracked regardless of
 * extension. Changes, deletion and recreation trigger a full client reload;
 * creating a previously requested missing include can recover a failed render.
 * Reloads refresh the whole page and do not preserve browser state.
 *
 * @param configuration - Template options and global or page-specific variables.
 * @returns A Vite plugin usable in development and production builds.
 */
export default function nunjucksPlugin(configuration: NunjucksPluginOptions = {}): Plugin {
  const locals = configuration.locals ?? {};
  const options: ConfigureOptions = {
    autoescape: true,
    lstripBlocks: true,
    noCache: true,
    throwOnUndefined: true,
    trimBlocks: true,
    ...configuration.options,
  };
  const sources = new WeakMap<DevEnvironment, Map<string, Set<string>>>();

  return {
    name: 'vite-plugin-nunjucks',
    enforce: 'pre',
    // Vite supplies the current environment through the hook receiver.
    hotUpdate(context) {
      // eslint-disable-next-line unicorn/no-this-outside-of-class
      const environment = this.environment;
      const entries = sources.get(environment);
      if (!entries) return;
      for (const paths of entries.values()) {
        if (paths.has(normalizePath(context.file))) {
          environment.hot.send({ type: 'full-reload' });
          return [];
        }
      }
      return;
    },
    transformIndexHtml: {
      order: 'pre',
      handler: async (html, context) => {
        const sourcePaths = new Set<string>();
        const client = context.server?.environments.client;
        if (client) {
          let entries = sources.get(client);
          if (!entries) {
            entries = new Map();
            sources.set(client, entries);
          }
          // Replace obsolete dependencies while retaining failed reads for recovery.
          entries.set(context.filename, sourcePaths);
        }
        // Nunjucks resolves explicit relative paths from their parent template, including nested includes.
        const loader: ILoaderAsync & Pick<Loader, 'isRelative' | 'resolve'> = {
          async: true,
          isRelative: name => /^(?:\.{1,2})[\\/]/.test(name),
          resolve: (parent, name) => resolvePath(dirname(parent), name),
          getSource(name, callback) {
            const path = resolvePath(dirname(context.filename), name);
            sourcePaths.add(normalizePath(path));
            // Vite owns watching; this also covers templates outside its app root.
            context.server?.watcher.add(path);
            callbackify(async () => {
              try {
                return { src: await readFile(path, 'utf8'), path, noCache: options.noCache ?? true };
              } catch (error) {
                // Let Nunjucks decide whether a missing source is optional.
                // Other I/O errors must still fail the render instead of hiding the cause.
                if (
                  error instanceof Error &&
                  'code' in error &&
                  (error.code === 'ENOENT' || error.code === 'ENOTDIR')
                ) {
                  // eslint-disable-next-line unicorn/no-null -- Nunjucks uses null to signal a missing source.
                  return null;
                }
                throw error;
              }
            })(callback);
          },
        };
        const environment = new Environment(loader, options);
        await configuration.configureEnvironment?.(environment);
        const pageLocals = locals[basename(context.path)];
        const templateLocals = {
          ...locals,
          ...(typeof pageLocals === 'object' && pageLocals !== null && !Array.isArray(pageLocals) && pageLocals),
        };
        // Supplying the entry filename also makes relative extends/includes work from the HTML entry.
        const template = new Template(html, environment, context.filename);
        return new Promise<string>((resolve, reject) => {
          template.render(templateLocals, (error, rendered) => {
            if (error) reject(error);
            else if (typeof rendered === 'string') resolve(rendered);
            else reject(new Error('Nunjucks returned no rendered HTML'));
          });
        });
      },
    },
  };
}
