# portfolio-landing

Under-construction landing page for [rishabhdoshi.com](https://rishabhdoshi.com)
— a plush 3D scale model of the Bauhaus Dessau, built with HTML, CSS and JS.
No build step and **no images**: the whole model is CSS transforms and
gradients, which is why the page is one file.

This is **Sheet A-001**. Its companion is
[experiments-landing](https://github.com/doshi-experiments/experiments-landing)
(Sheet A-002), the index of things actually built.

## Deploy

Connected to Cloudflare and deployed on push to `main` — usually live in
about a minute.

There is no build step and no `package.json`: `index.html` at the repo root
*is* the site, so the build command stays empty and the output directory is
the root. To work on it, open `index.html` in a browser — there's nothing to
install and nothing to run.

## The shared theme cookie

The light/dark toggle writes a `sheet-theme` cookie scoped to
`.rishabhdoshi.com`, so the choice follows you across the subdomains:

```js
document.cookie = 'sheet-theme=' + t + ';domain=.rishabhdoshi.com;path=/;' ...
```

`experiments.rishabhdoshi.com` and `rent-vs-buy.rishabhdoshi.com` both read
that same cookie before first paint, falling back to `localStorage` and then
to `prefers-color-scheme`. **Three repos depend on the name `sheet-theme` and
that domain scope** — renaming either here silently un-syncs the other two,
and nothing will fail loudly when it happens.

`localStorage` is also written, as the fallback for when the page is opened
somewhere the cookie domain doesn't apply (a local file, a preview URL).


## Shared design system (0.1.0)

This checkout consumes generated assets from `@doshi-experiments/design-system`.
The `design-system/release.json` file (under `public/` or `src/` where applicable)
records their version and hashes. Edit the shared token source, rebuild it, and
run its `scripts/sync.mjs` against this asset directory to upgrade. Do not edit
these generated files locally. Keep the `sheet-theme` cookie and pre-paint
stamp intact. Light/dark appearance and project identity are separate dimensions.
Hanken Grotesk is served locally with its OFL notice.
