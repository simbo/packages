import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import nunjucksPlugin from '@simbo/vite-plugin-nunjucks';
import { build, createServer, type Plugin, type ViteDevServer } from 'vite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import htmlMinifierPlugin, { type HtmlMinifierPluginOptions } from './html-minifier-plugin.js';

let directory: string;
let server: ViteDevServer | undefined;

beforeEach(async () => {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'vite-plugin-html-minifier-'));
  directory = await realpath(temporaryDirectory);
});
afterEach(async () => {
  await server?.close();
  server = undefined;
  await rm(directory, { recursive: true, force: true });
});

/**
 * Builds an actual HTML entry and reads the written output.
 *
 * @param html - Entry contents.
 * @param options - Explicit engine overrides.
 * @returns HTML after Vite and the minifier have completed.
 */
async function buildHtml(html: string, options?: HtmlMinifierPluginOptions): Promise<string> {
  await writeFile(join(directory, 'index.html'), html);
  await build({
    configFile: false,
    root: directory,
    logLevel: 'silent',
    plugins: [htmlMinifierPlugin(options)],
  });
  return readFile(join(directory, 'dist/index.html'), 'utf8');
}

describe('HTML minifier defaults', () => {
  it('collapses spaces conservatively, preserves one line break and inline separation', async () => {
    const html = await buildHtml('<main>   text   <span>one</span>   <em>two</em>\n\n   <b>three</b>   </main>');
    expect(html).toContain('<main> text <span>one</span> <em>two</em>\n<b>three</b> </main>');
  });

  it('preserves preformatted and textarea contents', async () => {
    const pre = '<pre>  first\n\n    second  </pre>';
    const textarea = '<textarea>  first\n\n    second  </textarea>';
    const html = await buildHtml(`${pre}${textarea}`);
    expect(html).toContain(pre);
    expect(html).toContain(textarea);
  });

  it('removes ordinary comments but retains engine-protected comments', async () => {
    const html = await buildHtml(
      '<!-- ordinary --><p>text</p><!--! license --><!-- #directive --><!--[if IE]><b>legacy</b><![endif]-->',
    );
    expect(html).not.toContain('ordinary');
    expect(html).toContain('<!--! license -->');
    expect(html).toContain('<!-- #directive -->');
    expect(html).toContain('<!--[if IE]><b>legacy</b><![endif]-->');
  });

  it('does not minify inline JavaScript or CSS by default', async () => {
    const script = '<script>console.log("keep"); debugger; const value = 1 + 2;</script>';
    const html = await buildHtml(`${script}<p style="color: red; padding: 0px 0px;">text</p>`);
    expect(html).toContain(script);
    expect(html).toContain('style="color: red; padding: 0px 0px;"');
  });

  it.each([
    { collapseWhitespace: false, input: '<p>  text   here  </p>', expected: '<p>  text   here  </p>' },
    { conservativeCollapse: false, input: '<div>   <p>text</p>   </div>', expected: '<div><p>text</p></div>' },
    {
      preserveLineBreaks: false,
      input: '<span>one</span>\n\n <em>two</em>',
      expected: '<span>one</span> <em>two</em>',
    },
    { removeComments: false, input: '<!-- keep --><p>text</p>', expected: '<!-- keep -->' },
  ])('honors false overrides: %j', async ({ input, expected, ...options }) => {
    expect(await buildHtml(input, options)).toContain(expected);
  });

  it('keeps caller options and defaults independent across builds and instances', async () => {
    const options = Object.freeze({ removeComments: false });
    expect(await buildHtml('<!-- keep --><p>  text  </p>', options)).toContain('<!-- keep -->');
    expect(options).toEqual({ removeComments: false });
    expect(await buildHtml('<!-- remove --><p>  text  </p>')).not.toContain('<!-- remove -->');
    expect(await buildHtml('<!-- keep --><p>  text  </p>', options)).toContain('<!-- keep -->');
  });
});

describe('Vite output pipeline', () => {
  it('renders Nunjucks before minifying multiple pages and preserves resolved asset references', async () => {
    await mkdir(join(directory, 'nested'));
    await writeFile(join(directory, 'partial.njk'), '<!-- template comment --><p>  {{ title }}   rendered  </p>');
    const entry =
      '<!doctype html><html><head><link rel="stylesheet" href="/style.css"></head><body>{% include "../partial.njk" %}<img src="/image.svg"><script type="module" src="/main.js"></script></body></html>';
    await writeFile(join(directory, 'index.html'), entry.replace('../partial.njk', './partial.njk'));
    await writeFile(join(directory, 'nested/about.html'), entry);
    await writeFile(join(directory, 'style.css'), 'body { color: red; }');
    await writeFile(join(directory, 'main.js'), 'console.log("keep module"); debugger;');
    const image = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>';
    await writeFile(join(directory, 'image.svg'), image);
    // A post HTML transform still runs inside Vite's HTML output hook, before minification.
    const lateHtml: Plugin = {
      name: 'late-html-fixture',
      enforce: 'post',
      transformIndexHtml: { order: 'post', handler: html => html.replace('</body>', '<!-- late comment --></body>') },
    };
    await build({
      configFile: false,
      root: directory,
      logLevel: 'silent',
      base: '/site/',
      plugins: [nunjucksPlugin({ locals: { title: 'Page' } }), htmlMinifierPlugin(), lateHtml],
      build: {
        minify: false,
        assetsInlineLimit: 0,
        rolldownOptions: { input: [join(directory, 'index.html'), join(directory, 'nested/about.html')] },
      },
    });
    for (const name of ['index.html', 'nested/about.html']) {
      const html = await readFile(join(directory, 'dist', name), 'utf8');
      expect(html).toContain('<p> Page rendered </p>');
      expect(html).not.toContain('comment');
      expect(html).not.toContain('{{');
      expect(html).not.toContain('{%');
      const references = [...html.matchAll(/(?:src|href)="(\/site\/assets\/[^"]+)"/g)].map(match => match[1]);
      expect(references).toHaveLength(3);
      for (const reference of references) {
        const source = await readFile(join(directory, 'dist', reference.replace('/site/', '')), 'utf8');
        if (reference.endsWith('.svg')) expect(source).toBe(image);
        if (reference.endsWith('.js')) {
          expect(source).toContain('console.log');
          expect(source).toContain('debugger');
          expect(source).not.toContain('html-minifier-terser');
        }
        if (reference.endsWith('.css')) expect(source).toContain('color');
      }
    }
  });

  it('decodes binary HTML as UTF-8 and leaves other emitted assets unchanged', async () => {
    await writeFile(join(directory, 'index.html'), '<p>entry</p>');
    const binary = new Uint8Array([0, 255, 12, 128]);
    const encoder = new TextEncoder();
    await build({
      configFile: false,
      root: directory,
      logLevel: 'silent',
      plugins: [
        {
          name: 'emit-fixtures',
          generateBundle() {
            // eslint-disable-next-line unicorn/no-this-outside-of-class -- Rolldown supplies the hook context.
            this.emitFile({
              type: 'asset',
              fileName: 'nested/binary.html',
              source: encoder.encode('<!-- remove --><p>  Grüße 🌱  </p>'),
            });
            // eslint-disable-next-line unicorn/no-this-outside-of-class -- Rolldown supplies the hook context.
            this.emitFile({ type: 'asset', fileName: 'untouched.bin', source: binary });
            // eslint-disable-next-line unicorn/no-this-outside-of-class -- Rolldown supplies the hook context.
            this.emitFile({ type: 'asset', fileName: 'untouched.txt', source: '<!-- keep -->  text' });
          },
        },
        htmlMinifierPlugin(),
      ],
    });
    expect(await readFile(join(directory, 'dist/nested/binary.html'), 'utf8')).toBe('<p> Grüße 🌱 </p>');
    const writtenBinary = await readFile(join(directory, 'dist/untouched.bin'));
    expect(new Uint8Array(writtenBinary)).toEqual(binary);
    expect(await readFile(join(directory, 'dist/untouched.txt'), 'utf8')).toBe('<!-- keep -->  text');
  });

  it('fails with the HTML filename and parser cause when strict parsing rejects emitted HTML', async () => {
    await writeFile(join(directory, 'index.html'), '<p>entry</p>');
    await expect(
      build({
        configFile: false,
        root: directory,
        logLevel: 'silent',
        plugins: [
          {
            name: 'invalid-html-fixture',
            generateBundle() {
              // eslint-disable-next-line unicorn/no-this-outside-of-class -- Rolldown supplies the hook context.
              this.emitFile({ type: 'asset', fileName: 'broken.html', source: '<div title="unterminated' });
            },
          },
          htmlMinifierPlugin({ continueOnParseError: false }),
        ],
      }),
    ).rejects.toThrow('Failed to minify HTML asset broken.html');
  });

  it('does not register or process HTML in development', async () => {
    server = await createServer({
      configFile: false,
      root: directory,
      logLevel: 'silent',
      server: { middlewareMode: true, ws: false },
      plugins: [htmlMinifierPlugin()],
    });
    expect(server.config.plugins.some(plugin => plugin.name === 'vite-plugin-html-minifier')).toBe(false);
    const input = '<!-- keep --><p>   text   </p>';
    expect(await server.transformIndexHtml('/index.html', input)).toContain(input);
  });
});
