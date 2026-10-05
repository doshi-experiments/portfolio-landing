# Rishabh Doshi’s portfolio

A partly assembled scale model of the Bauhaus Dessau becomes a complete building as visitors scroll. The portfolio introduction and three brief process moments sit beside it; contact links remain available throughout. Visitors who request reduced motion get the completed model and ordinary document flow.

The model uses the existing HTML/CSS 3D engine, with a crane that tracks construction. The site has no build step: `index.html`, `portfolio.css`, and the generated `design-system/` assets are served directly.

## Shared identity

Navigation, the labeled System/Light/Dark appearance control, Commissioner, colors, and controls come from `@doshi-experiments/design-system`. Change that source package and use its central rollout command to update the checked-in assets. `design-system/release.json` records the release and integrity hashes; generated assets are not edited here.

The `sheet-theme` preference uses a `.rishabhdoshi.com` cookie across the public sites, with localStorage as a fallback. The shared prepaint script applies it before styles paint.

## Preview and deploy

Serve the repository root with a local HTTP server, for example `python3 -m http.server 8080`. JavaScript modules need HTTP rather than opening the HTML as a file.

Cloudflare deploys pushes to `main`. `wrangler.jsonc` serves the root asset directory, and `.assetsignore` includes only the site and shared design assets. There is no build command.
