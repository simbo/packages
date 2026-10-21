# Vite Plugin Nunjucks

📦
**[@simbo/vite-plugin-nunjucks](https://www.npmjs.com/package/@simbo/vite-plugin-nunjucks)**

**HTML pages, shared layouts, and reusable templates — powered by Nunjucks in
Vite.**

Build pages from shared layouts and small, reusable templates. Pass in your site
data, add page-specific details, and let Vite handle the scripts and assets in
the resulting HTML. Edit an included template and see the page reload during
development; use the same templates for your production build.

## Features

- 🧩 **Layouts that grow with your site.** Use Nunjucks includes, macros, and
  inheritance directly in ordinary Vite HTML entries.
- 🔄 **Reloads follow your templates.** Requested includes and layouts are
  tracked automatically, regardless of their file extension. Changes, deletions,
  and recreations of known templates trigger a full browser reload.
- 🌱 **Recover as you work.** If an include is missing, creating that file
  triggers a reload so the page can render again.
- 🧭 **Paths you can follow.** Use `./` and `../` from the containing template,
  including nested partials. Shared templates outside the Vite root can also be
  included and watched.
- ⚡ **Asynchronous template loading.** Included templates and layouts are read
  through an asynchronous filesystem loader.
- ✨ **Fresh rendering context.** Each HTML render gets its own Nunjucks
  environment. Global locals and page overrides supply the data;
  `configureEnvironment` adds your filters, globals, and extensions.
- 🛡️ **Useful defaults, fully typed.** HTML escaping, errors for undefined
  output, whitespace trimming, and uncached template loading are enabled by
  default. Configure the plugin with TypeScript definitions included.

This is a Vite-specific plugin: templates render before Vite processes HTML,
scripts, and assets, in development and production. It uses Vite's HTML pipeline
and watcher and works independently of Vue, React, or any other UI framework.
The plugin adds no Nunjucks runtime to your browser bundle.

## Requirements

- Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`
- Vite `^8.3.1`
- An ESM Vite configuration

## Quick start

```sh
npm install --save-dev vite @simbo/vite-plugin-nunjucks
```

Nunjucks and its TypeScript definitions are installed automatically as plugin
dependencies. Register the plugin in `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import nunjucksPlugin from '@simbo/vite-plugin-nunjucks';

export default defineConfig({
  plugins: [
    nunjucksPlugin({
      locals: { siteName: 'My website' },
    }),
  ],
});
```

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{{ siteName }}</title>
  </head>
  <body>
    {% include "./templates/header.njk" %}
    <h1>Welcome to {{ siteName }}</h1>
  </body>
</html>
```

Create `templates/header.njk`:

```html
<header><a href="/">{{ siteName }}</a></header>
```

Run `npx vite` for development or `npx vite build` for production. HTML files
remain Vite entry points; `.njk` is a convenient extension for partials and
layouts, not an additional entry point type.

## Global and page-specific locals

All locals are available to every page. An object keyed by the HTML filename
adds or overrides variables for that page:

```ts
nunjucksPlugin({
  locals: {
    siteName: 'My website',
    title: 'Welcome',
    'about.html': { title: 'About us' },
  },
});
```

Matching uses the filename **basename**, so `about.html` and `team/about.html`
share the same overrides. Merging is shallow. Arrays, null, and primitive page
values do not override globals. Page objects also remain accessible as global
locals through their keys.

HTML is escaped by default, including values in attributes. Do not expose
secrets as locals: rendered values become part of the public HTML.

## Layouts and paths

A page can extend a layout:

```html
{% extends "./templates/layout.njk" %} {% block content %}
<h1>{{ title }}</h1>
{% endblock %}
```

In `templates/layout.njk`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{{ title }}</title>
  </head>
  <body>
    {% block content %}{% endblock %}
  </body>
</html>
```

- Names beginning with `./` or `../` resolve from the containing template.
- Other relative names resolve from the HTML entry's directory, even in nested
  includes. They do not resolve from Vite's root or a separate search directory.
- Absolute filesystem paths are accepted. Templates outside Vite's root can be
  included and watched.
- Use `/` in template paths for portable projects. Native Windows paths have not
  been verified on Windows.

Includes and inheritance load asynchronously. Required missing files, invalid
syntax, and undefined output reject the HTML transform and fail production
builds. Nunjucks `ignore missing` is supported; creating a requested optional
template can trigger a development reload.

When loading includes inside a loop, use Nunjucks' `asyncEach` rather than
`for`, because the filesystem loader is asynchronous:

```html
{% asyncEach item in items %} {% include "./templates/item.njk" %} {% endeach %}
```

Ordinary loops without template loading can still use `for`. See
[Nunjucks asynchronous support](https://mozilla.github.io/nunjucks/api.html#asynchronous-support).

## Options

```ts
import nunjucksPlugin, {
  type NunjucksPluginOptions,
} from '@simbo/vite-plugin-nunjucks';
```

| Option                 | Default   | Purpose                                           |
| ---------------------- | --------- | ------------------------------------------------- |
| `locals`               | `{}`      | Global variables and page overrides               |
| `options`              | See below | Nunjucks environment settings                     |
| `configureEnvironment` | None      | Configure each fresh environment before rendering |

The default Nunjucks settings are:

```ts
{
  autoescape: true,
  throwOnUndefined: true,
  trimBlocks: true,
  lstripBlocks: true,
  noCache: true,
}
```

Override them with `options`, for example
`options: { throwOnUndefined: false }`. Disabling `autoescape` allows raw HTML
output and should be intentional.

The plugin owns its filesystem loader and watcher. Nunjucks `watch`, `web`, and
`express` settings do not configure those integrations. `noCache: false` can
reuse compiled includes within a render; it does not cache across renders,
because every HTML render creates a new environment.

## Custom filters, globals, and extensions

Use Nunjucks' own registration API through `configureEnvironment`:

```ts
nunjucksPlugin({
  configureEnvironment(environment) {
    environment.addFilter('shout', (value: string) => value.toUpperCase());
    environment.addGlobal('copyrightYear', 2026);
  },
});
```

```html
<p>{{ "hello" | shout }} — {{ copyrightYear }}</p>
```

The callback may return a Promise and is awaited before template compilation. It
runs **for each HTML render**, so keep it repeatable. Register asynchronous
filters using Nunjucks' callback-based `addFilter(name, callback, true)` API; a
Promise-returning filter alone is not sufficient. Extensions can be registered
with `environment.addExtension`. Third-party extensions must be compatible with
the installed Nunjucks 3 engine.

## Template-aware development reloads

Save a shared header or layout and the browser reloads with the updated HTML.
The plugin tracks the files requested by each HTML entry and registers them with
Vite's watcher. You do not need to maintain template globs or an extension list.
This also covers known templates outside the Vite root.

For example, when `index.html` includes `templates/header.njk`:

| Your change                                     | Plugin behavior                                |
| ----------------------------------------------- | ---------------------------------------------- |
| Edit `header.njk`                               | Reload the browser and render its new contents |
| Delete `header.njk`                             | Reload and surface the missing-template error  |
| Recreate `header.njk`                           | Reload so the page can render again            |
| Create a previously requested, missing include  | Reload to recover the failed render            |
| Edit a template no rendered entry has requested | No reload from this plugin                     |

Reloads refresh the full page; they do not preserve browser state. They apply to
the client environment rather than only the particular page that used the
changed template. Other Vite plugins may also react to file changes.

Dependencies are replaced when an entry renders again. Tracking starts when a
file is requested, including failed reads, so creating a missing include can
recover the page. Vite's watcher exclusions and filesystem limitations still
apply. Separate server environments keep separate tracking state.

## Scope and limits

Rendering occurs only for HTML processed through Vite's `transformIndexHtml`
hook. Frameworks that replace Vite's HTML entry handling may not use this hook.
Production watch-mode dependency rebuilding is not provided by this plugin.

**Templates must be trusted project files.** Nunjucks is not a sandbox for
untrusted templates. Filesystem access is not restricted to the Vite root, and
HTML escaping does not isolate template execution.

## Documentation

- [Plugin API reference](https://simbo.de/packages/modules/_simbo_vite-plugin-nunjucks/)
- [Nunjucks template syntax](https://mozilla.github.io/nunjucks/templating.html)
- [Nunjucks API](https://mozilla.github.io/nunjucks/api.html)
- [Changelog](https://github.com/simbo/packages/blob/main/packages/vite-plugin-nunjucks/CHANGELOG.md)
- [Report an issue](https://github.com/simbo/packages/issues)

## License

[MIT © 2026 Simon Lepel](./LICENSE.md)
