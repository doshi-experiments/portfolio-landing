# Rishabh Doshi’s portfolio

The page opens with its own version history. Scrolling moves through five stops: the hand-made Framer portfolio from 2025, the first AI-built blueprint from August 2026, a never-shipped Astro detour from September, the blue identity of 4 October, and now. Each earlier version is a live, scaled-down copy of that page inside the frame; the version slider mirrors scroll and also drives it. At "Now" the frame dissolves into the partly assembled scale model of the Bauhaus Dessau, and scrolling on completes the building beside three brief process moments. Opening an earlier version shows it at full size over the timeline; Esc or "Back to the timeline" returns to the same stop.

Visitors who request reduced motion, or who have no JavaScript, get an ordinary document: the five stops with their links, the completed model, and neither frame nor slider.

The site has no build step: `index.html`, `portfolio.css`, `portfolio.js`, the generated `design-system/` assets and the archived copies under `versions/` are served directly. `docs/versions.md` records where each archive came from, which edits it allows, and how to add a stop.

## Shared identity

Navigation, the labeled System/Light/Dark appearance control, Commissioner, colors, and controls come from `@doshi-experiments/design-system`. The portfolio uses rust accents on charcoal, with a compatible light appearance. Its header omits the redundant project name. Change that source package and use its central rollout command to update the checked-in assets. `design-system/release.json` records the release and integrity hashes; generated assets are not edited here. The October 2026 archive carries its own 0.5.0 snapshot under `versions/2026-10-blue/design-system/`, frozen the same way.

The `sheet-theme` preference uses a `.rishabhdoshi.com` cookie across the public sites, with localStorage as a fallback. The shared prepaint script applies it before styles paint. First-time visitors default to Dark via `data-appearance-default`; saved System, Light, or Dark preferences take precedence.

## Preview and deploy

Serve the repository root with a local HTTP server, for example `python3 -m http.server 8080`. JavaScript modules need HTTP rather than opening the HTML as a file.

`node tools/check-links.mjs` verifies that every local reference resolves and that each archive only points inside itself. CI runs it alongside an integrity check of every `design-system/release.json`.

Cloudflare deploys pushes to `main`. `wrangler.jsonc` serves the root asset directory, and `.assetsignore` includes only the site, the shared design assets and `versions/`. There is no build command.
