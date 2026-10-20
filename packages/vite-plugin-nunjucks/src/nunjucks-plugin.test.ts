// @vitest-environment node

import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { build, createServer, type ViteDevServer } from 'vite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import nunjucksPlugin, { type NunjucksPluginOptions } from './nunjucks-plugin.js';

let directory: string;
let server: ViteDevServer | undefined;

beforeEach(async () => {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'vite-plugin-nunjucks-'));
  directory = await realpath(temporaryDirectory);
});
afterEach(async () => {
  await server?.close();
  server = undefined;
  vi.restoreAllMocks();
  await rm(directory, { recursive: true, force: true });
});

/**
 * Exercises the plugin through Vite instead of casting incomplete hook contexts.
 *
 * @param options - Nunjucks options and template variables for the scenario.
 * @returns An isolated development server without an HTTP listener.
 */
async function startServer(options?: NunjucksPluginOptions): Promise<ViteDevServer> {
  server = await createServer({
    configFile: false,
    root: directory,
    server: { middlewareMode: true },
    plugins: [nunjucksPlugin(options)],
  });
  return server;
}

describe('Nunjucks template variables', () => {
  it('escapes globals in text and attributes and applies page-specific overrides', async () => {
    const vite = await startServer({
      locals: {
        title: 'global',
        description: 'A "label" <designer> & more',
        'index.html': { title: 'page' },
      },
    });
    const html = await vite.transformIndexHtml(
      '/index.html',
      '<title>{{ title }}</title><meta name="description" content="{{ description }}">',
    );
    expect(html).toContain('<title>page</title>');
    expect(html).toContain('content="A &quot;label&quot; &lt;designer&gt; &amp; more"');
    const otherPage = await vite.transformIndexHtml('/other.html', '<title>{{ title }}</title>');
    expect(otherPage).toContain('<title>global</title>');
  });

  it('renders plain HTML with default options and rejects missing variables', async () => {
    const vite = await startServer();
    expect(await vite.transformIndexHtml('/index.html', '<p>plain</p>')).toContain('<p>plain</p>');
    await expect(vite.transformIndexHtml('/index.html', '{{ missing }}')).rejects.toThrow();
  });

  it('applies caller-provided Nunjucks options', async () => {
    const vite = await startServer({
      options: { autoescape: false, throwOnUndefined: false },
      locals: { text: '<b>label</b>' },
    });
    expect(await vite.transformIndexHtml('/index.html', '<p>{{ text }}{{ missing }}</p>')).toContain(
      '<p><b>label</b></p>',
    );
  });

  it.each([undefined, null, [], 'not an object'])(
    'ignores a non-object page override %j while keeping global locals',
    async pageLocals => {
      const vite = await startServer({ locals: { title: 'global', 'index.html': pageLocals } });
      expect(await vite.transformIndexHtml('/index.html', '<title>{{ title }}</title>')).toContain(
        '<title>global</title>',
      );
    },
  );
});

describe('Nunjucks template files', () => {
  it('renders includes and locals in production builds without a development server', async () => {
    await writeFile(join(directory, 'index.html'), '<main>{% include "partial.njk" %}</main>');
    await writeFile(join(directory, 'partial.njk'), '<b>{{ name }}</b>');
    await build({
      configFile: false,
      root: directory,
      logLevel: 'silent',
      plugins: [nunjucksPlugin({ locals: { name: 'Simon' } })],
    });
    expect(await readFile(join(directory, 'dist', 'index.html'), 'utf8')).toContain('<main><b>Simon</b></main>');
  });

  it('loads includes and sees edits on the next render', async () => {
    const file = join(directory, 'partial.njk');
    await writeFile(file, '<b>{{ name }}</b>');
    const vite = await startServer({ locals: { name: 'Simon' } });
    const template = '{% include "partial.njk" %}';
    expect(await vite.transformIndexHtml('/index.html', template)).toContain('<b>Simon</b>');
    await writeFile(file, '<i>{{ name }}</i>');
    expect(await vite.transformIndexHtml('/index.html', template)).toContain('<i>Simon</i>');
  });

  it('resolves nested relative includes and template inheritance from the parent file', async () => {
    await mkdir(join(directory, 'partials'));
    await writeFile(join(directory, 'base.njk'), '<main>{% block body %}{% endblock %}</main>');
    await writeFile(join(directory, 'partials', 'outer.njk'), '{% include "./inner.njk" %}');
    await writeFile(join(directory, 'partials', 'inner.njk'), '{% include "../shared.njk" %}');
    await writeFile(join(directory, 'shared.njk'), '<b>{{ name }}</b>');
    const vite = await startServer({ locals: { name: 'Simon' } });
    const html = await vite.transformIndexHtml(
      '/index.html',
      '{% extends "./base.njk" %}{% block body %}{% include "./partials/outer.njk" %}{% endblock %}',
    );
    expect(html).toContain('<main><b>Simon</b></main>');
  });

  it('rejects missing includes and invalid template syntax', async () => {
    const vite = await startServer();
    await expect(vite.transformIndexHtml('/index.html', '{% include "missing.njk" %}')).rejects.toThrow();
    await expect(vite.transformIndexHtml('/index.html', '{% if %}')).rejects.toThrow();
  });

  it('watches included sources and reloads tracked templates while leaving unrelated updates alone', async () => {
    const file = join(directory, 'partial.njk');
    const unrelated = join(directory, 'unrelated.njk');
    await writeFile(file, '<b>included</b>');
    await writeFile(unrelated, 'unrelated');
    const plugin = nunjucksPlugin();
    const processed: string[] = [];
    server = await createServer({
      configFile: false,
      root: directory,
      server: { middlewareMode: true },
      plugins: [
        plugin,
        {
          name: 'observe-template-updates',
          // This later hook makes negative assertions wait for the Nunjucks hook to finish.
          hotUpdate(context) {
            processed.push(context.file);
          },
        },
      ],
    });
    const watch = vi.spyOn(server.watcher, 'add');
    const send = vi.spyOn(server.environments.client.hot, 'send');
    await server.transformIndexHtml('/index.html', '{% include "partial.njk" %}');
    expect(watch).toHaveBeenCalledWith(file);

    server.watcher.emit('change', unrelated);
    await vi.waitFor(() => {
      expect(processed).toContain(unrelated);
    });
    expect(send).not.toHaveBeenCalled();

    server.watcher.emit('change', file);
    await vi.waitFor(() => {
      expect(processed).toContain(file);
    });
    expect(send).toHaveBeenCalledWith({ type: 'full-reload' });
  });
});

describe('Public package behavior', () => {
  it('exports the factory and configures each fresh environment before rendering', async () => {
    const { default: factory } = await import('./index.js');
    const configureEnvironment = vi.fn(async (environment: import('nunjucks').Environment) => {
      await Promise.resolve();
      environment.addFilter('shout', (value: string) => value.toUpperCase());
      environment.addFilter(
        'later',
        (value: string, callback: (error: null, result: string) => void) => {
          globalThis.queueMicrotask(() => {
            callback(null, `${value}!`);
          });
        },
        true,
      );
      environment.addGlobal('greeting', 'hello');
    });
    expect(factory).toBe(nunjucksPlugin);
    const vite = await startServer({ configureEnvironment });
    for (const page of ['/index.html', '/other.html']) {
      expect(await vite.transformIndexHtml(page, '{{ greeting | shout | later }}')).toContain('HELLO!');
    }
    expect(configureEnvironment).toHaveBeenCalledTimes(2);
    expect(configureEnvironment.mock.calls[0]?.[0]).not.toBe(configureEnvironment.mock.calls[1]?.[0]);
  });

  it('renders custom extension tags registered on the environment', async () => {
    const vite = await startServer({
      configureEnvironment(environment) {
        const extension = {
          tags: ['greeting'],
          parse(
            parser: { nextToken: () => unknown; advanceAfterBlockEnd: (value: string) => void },
            nodes: { CallExtension: new (extension: unknown, method: string) => unknown },
          ): unknown {
            parser.nextToken();
            parser.advanceAfterBlockEnd('greeting');
            return new nodes.CallExtension(extension, 'run');
          },
          run: (): string => 'Hello from extension',
        };
        environment.addExtension('greeting', extension);
      },
    });
    expect(await vite.transformIndexHtml('/index.html', '{% greeting %}')).toContain('Hello from extension');
  });

  it('tracks missing includes so creation recovers a failed render', async () => {
    const vite = await startServer();
    const template = '{% include "./missing.njk" %}';
    await expect(vite.transformIndexHtml('/index.html', template)).rejects.toThrow();
    const send = vi.spyOn(vite.environments.client.hot, 'send');
    await writeFile(join(directory, 'missing.njk'), 'recovered');
    await vi.waitFor(() => {
      expect(send).toHaveBeenCalledWith({ type: 'full-reload' });
    });
    expect(await vite.transformIndexHtml('/index.html', template)).toContain('recovered');
  });

  it('propagates environment configuration errors', async () => {
    const vite = await startServer({
      configureEnvironment() {
        throw new Error('configuration failed');
      },
    });
    await expect(vite.transformIndexHtml('/index.html', 'hello')).rejects.toThrow('configuration failed');
  });

  it('keeps same-basename entry loaders separate and shares basename overrides', async () => {
    for (const name of ['first', 'second']) {
      await mkdir(join(directory, name));
      await writeFile(join(directory, name, 'partial.njk'), `${name}:{{ title }}`);
    }
    const vite = await startServer({ locals: { 'index.html': { title: 'shared' } } });
    const template = '{% include "./partial.njk" %}';
    expect(await vite.transformIndexHtml('/first/index.html', template)).toContain('first:shared');
    expect(await vite.transformIndexHtml('/second/index.html', template)).toContain('second:shared');
  });

  it('builds multiple HTML entries with isolated include paths', async () => {
    for (const name of ['first', 'second']) {
      await mkdir(join(directory, name));
      await writeFile(join(directory, name, 'index.html'), '{% include "./partial.njk" %}');
      await writeFile(join(directory, name, 'partial.njk'), `<p>${name}</p>`);
    }
    await build({
      configFile: false,
      root: directory,
      logLevel: 'silent',
      plugins: [nunjucksPlugin()],
      build: {
        rolldownOptions: { input: [join(directory, 'first/index.html'), join(directory, 'second/index.html')] },
      },
    });
    for (const name of ['first', 'second']) {
      expect(await readFile(join(directory, 'dist', name, 'index.html'), 'utf8')).toContain(`<p>${name}</p>`);
    }
  });

  it('supports includes outside the root and refreshes obsolete dependency tracking', async () => {
    await mkdir(join(directory, 'app'));
    const outer = join(directory, 'outside.njk');
    await writeFile(outer, 'outside');
    const processed: string[] = [];
    server = await createServer({
      configFile: false,
      root: join(directory, 'app'),
      server: { middlewareMode: true },
      plugins: [
        nunjucksPlugin(),
        {
          name: 'observe-obsolete-template',
          hotUpdate(context) {
            processed.push(context.file);
          },
        },
      ],
    });
    const watch = vi.spyOn(server.watcher, 'add');
    expect(await server.transformIndexHtml('/index.html', '{% include "../outside.njk" %}')).toContain('outside');
    expect(watch).toHaveBeenCalledWith(outer);
    await server.transformIndexHtml('/index.html', 'no includes');
    const send = vi.spyOn(server.environments.client.hot, 'send');
    server.watcher.emit('change', outer);
    await vi.waitFor(() => {
      expect(processed).toContain(outer);
    });
    expect(send).not.toHaveBeenCalled();
  });

  it('reloads known sources on deletion and recreation and keeps servers isolated', async () => {
    const plugin = nunjucksPlugin();
    const processed: string[] = [];
    server = await createServer({
      configFile: false,
      root: directory,
      server: { middlewareMode: true },
      plugins: [
        plugin,
        {
          name: 'observe-recovery',
          hotUpdate(context) {
            processed.push(`${context.type}:${context.file}`);
          },
        },
      ],
    });
    const otherProcessed: string[] = [];
    const second = await createServer({
      configFile: false,
      root: directory,
      server: { middlewareMode: true },
      plugins: [
        plugin,
        {
          name: 'observe-isolation',
          hotUpdate(context) {
            otherProcessed.push(`${context.type}:${context.file}`);
          },
        },
      ],
    });
    try {
      const file = join(directory, 'recover.njk');
      await writeFile(file, 'original');
      await server.transformIndexHtml('/index.html', '{% include "./recover.njk" %}');
      const send = vi.spyOn(server.environments.client.hot, 'send');
      const otherSend = vi.spyOn(second.environments.client.hot, 'send');
      await rm(file);
      await vi.waitFor(() => {
        expect(processed).toContain(`delete:${file}`);
      });
      await writeFile(file, 'recreated');
      await vi.waitFor(() => {
        expect(processed).toContain(`create:${file}`);
      });
      // Both servers receive real filesystem events; only the rendering server tracks this source.
      await vi.waitFor(() => {
        expect(otherProcessed).toContain(`create:${file}`);
      });
      expect(send).toHaveBeenCalledWith({ type: 'full-reload' });
      expect(otherSend).not.toHaveBeenCalled();
      expect(await server.transformIndexHtml('/index.html', '{% include "./recover.njk" %}')).toContain('recreated');
    } finally {
      await second.close();
    }
  });
});
