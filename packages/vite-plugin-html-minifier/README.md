# Vite Plugin HTML Minifier

📦
**[@simbo/vite-plugin-html-minifier](https://www.npmjs.com/package/@simbo/vite-plugin-html-minifier)**

**Render your pages, let Vite resolve their assets, then minify the finished
HTML.**

A small Vite wrapper around
[html-minifier-terser](https://github.com/terser/html-minifier-terser). Use
shared whitespace and comment defaults across production pages while keeping
development HTML untouched. No minifier runtime is added to the browser bundle.

## Features

- ✨ **Shared defaults.** Collapse whitespace and remove ordinary comments with
  one plugin registration.
- 🎛️ **Typed overrides.** Pass engine options directly, including explicit
  `false` values for individual defaults.
- 📄 **Multi-page builds.** Process emitted `.html` assets, including nested
  paths.
- 🧩 **Templates first.** Combine with Nunjucks to minify rendered pages after
  Vite processes their scripts, styles and asset references.

## Requirements

- Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`
- Vite `^8.3.1` (Vite 8 only)
- An ESM Vite configuration

## Quick start

```sh
npm install --save-dev vite @simbo/vite-plugin-html-minifier
```

The engine and its TypeScript definitions are installed automatically. Register
the plugin in `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import htmlMinifierPlugin from '@simbo/vite-plugin-html-minifier';

export default defineConfig({
  plugins: [htmlMinifierPlugin()],
});
```

Run `npx vite build` to minify generated HTML. During `npx vite`, the plugin is
excluded from the development pipeline and performs no HTML processing.

## With Nunjucks

Install
[`@simbo/vite-plugin-nunjucks`](https://www.npmjs.com/package/@simbo/vite-plugin-nunjucks)
as a dev dependency and register it first:

```ts
import { defineConfig } from 'vite';
import nunjucksPlugin from '@simbo/vite-plugin-nunjucks';
import htmlMinifierPlugin from '@simbo/vite-plugin-html-minifier';

export default defineConfig({
  plugins: [
    nunjucksPlugin({ locals: { title: 'My website' } }),
    htmlMinifierPlugin(),
  ],
});
```

Nunjucks renders templates and locals through Vite's early HTML pipeline. Vite
then processes scripts, styles and asset URLs; the minifier processes the
emitted HTML. This combination is covered by real multi-page build tests.

## Options

Options are passed directly to the engine, overriding these four defaults:

```ts
{
  collapseWhitespace: true,
  conservativeCollapse: true,
  preserveLineBreaks: true,
  removeComments: true,
}
```

```ts
import htmlMinifierPlugin, {
  type HtmlMinifierPluginOptions,
} from '@simbo/vite-plugin-html-minifier';

const options: HtmlMinifierPluginOptions = {
  removeComments: false,
  preserveLineBreaks: false,
};

htmlMinifierPlugin(options);
```

The plugin does not mutate your options. All regular
[engine options](https://github.com/terser/html-minifier-terser#options-quick-reference)
are available. `minifyCSS` and `minifyJS` are not enabled by the plugin;
enabling them explicitly can add processing alongside Vite's own optimizations.
The plugin does not enable removal of `console` or `debugger`.

### Whitespace and comments

With these defaults, runs of whitespace collapse to one space, or one newline
when the run contains line breaks. Spaces separating inline elements are
retained: `<span>one</span>   <em>two</em>` becomes
`<span>one</span> <em>two</em>`. Whitespace inside `<pre>` and `<textarea>` is
preserved by the engine. Disabling `collapseWhitespace` also disables the
associated conservative-collapse and line-break behavior.

“Conservative” does not guarantee identical rendering for every document. HTML
minification does not evaluate your CSS: whitespace-sensitive layouts, custom
elements or CSS such as `white-space: pre-wrap` need review. Preserved line
breaks are collapsed, not an exact copy of the original formatting.

Ordinary comments are removed. The engine's default `ignoreCustomComments`
protects comments beginning with `!` or optional whitespace followed by `#`;
conditional comments are also retained. Set `ignoreCustomComments: []` to remove
those custom protected comments, or `removeComments: false` to retain comments.
Removing comments can affect tools or application code that use them as markers.

## Build pipeline and scope

The plugin uses `apply: 'build'` and `enforce: 'post'` with the sequential
`generateBundle` hook. In the tested Vite versions, Vite's own HTML output hook
runs first, including normal and post `transformIndexHtml` hooks and final asset
URL substitution. The minifier therefore sees emitted HTML with resolved script,
stylesheet and image references. String sources are used directly; binary
sources are decoded as UTF-8. Non-HTML assets and JavaScript chunks are left
unchanged.

All `.html` assets present at that point are processed. For multi-page sites,
configure Vite's `build.rolldownOptions.input` as usual; nested entry paths
remain nested in the output. Files copied directly from `public/` do not pass
through the output bundle and are outside this plugin's scope.

The plugin array orders plugins within Vite's enforcement groups; it does not
provide a universal last-processing guarantee. Later output hooks can change
HTML again or emit additional HTML. Hook-specific ordering in another plugin can
also affect execution. No extra watcher, template renderer or cache is added.

Engine failures abort the build with the affected HTML filename and the original
error as its cause. The engine is a minifier rather than an HTML validator and
accepts many malformed documents. `continueOnParseError: false` rejects parser
errors (for example an unterminated quoted attribute); setting it to `true`
explicitly permits parser recovery. Vite can reject invalid entry HTML earlier.

## Documentation

- [Plugin API reference](https://simbo.de/packages/modules/_simbo_vite-plugin-html-minifier/)
- [Engine source and options](https://github.com/terser/html-minifier-terser)
- [Changelog](./CHANGELOG.md)
- [Report an issue](https://github.com/simbo/packages/issues)

## License

[MIT © Simon Lepel](./LICENSE.md)
