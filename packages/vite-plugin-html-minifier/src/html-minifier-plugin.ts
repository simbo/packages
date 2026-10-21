import { minify, type Options } from 'html-minifier-terser';
import type { Plugin } from 'vite';

/**
 * html-minifier-terser options, applied directly over the plugin's four defaults.
 * CSS and JavaScript minification remain disabled unless explicitly enabled.
 * See the engine's option reference for parser and whitespace tradeoffs.
 */
export type HtmlMinifierPluginOptions = Options;

/**
 * Minifies emitted HTML assets after Vite renders templates and resolves asset URLs.
 * Only builds are processed; development HTML is untouched. Other plugins running
 * later can still change HTML or emit additional assets.
 *
 * @param configuration - Engine options overriding whitespace collapse, conservative
 * collapse, preserved line breaks and comment removal (all enabled by default).
 * @returns A build-only Vite plugin with a post-ordered generateBundle hook.
 */
export default function htmlMinifierPlugin(configuration: HtmlMinifierPluginOptions = {}): Plugin {
  const options: HtmlMinifierPluginOptions = {
    collapseWhitespace: true,
    conservativeCollapse: true,
    preserveLineBreaks: true,
    removeComments: true,
    ...configuration,
  };

  return {
    name: 'vite-plugin-html-minifier',
    apply: 'build',
    enforce: 'post',
    async generateBundle(_outputOptions, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type !== 'asset' || !file.fileName.endsWith('.html')) continue;
        const decoder = new TextDecoder();
        const html = typeof file.source === 'string' ? file.source : decoder.decode(file.source);
        try {
          file.source = await minify(html, { ...options });
        } catch (error) {
          throw new Error(`Failed to minify HTML asset ${file.fileName}`, { cause: error });
        }
      }
    },
  };
}
