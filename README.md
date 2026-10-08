# Rishabh Doshi’s portfolio

A standalone recreation of [the Framer portfolio](https://orange-pentagon-065454.framer.app/). The site uses ordinary HTML, CSS and JavaScript, with locally hosted illustrations and fonts. There is no application build step or Framer runtime.

## Pages

- `/` — animated introduction, selected work and project archive
- `/about/` — background, frequently asked questions and work history
- `/shipment/` — truck and driver management case study
- `/genai/` — generative AI travel claims case study
- `/healthcare/` — healthcare and benefits overview
- `/wells-fargo/` — brokerage concept
- `/anm/` — healthcare in rural India

The original Squarespace archive projects remain external links. Archive links open in a new tab and are labeled accordingly. Archive descriptions appear on hover or keyboard focus on desktop and remain visible on touch screens. The typing introduction respects reduced-motion preferences.

## Design and assets

`portfolio.css` owns the small design system and homepage layout; page-specific styles are loaded separately. [Design notes](docs/design.md) describe the reference, typography, colors and responsive layout. [Asset sources](assets/SOURCES.md) record the original imagery and font provenance. Font licenses are included in `assets/fonts/`. The [About asset notes](assets/about/README.md) cover the original dog animation and its local player; `assets/pages/*-sources.json` maps case-study assets to their reference URLs.

The inherited `design-system/` snapshot is not loaded by this recreation or included in deployment assets. The new branch has no dependency on the shared app palette.

## Local preview

From this directory:

```sh
python3 -m http.server 4175 --bind 127.0.0.1
```

Open `http://127.0.0.1:4175/`. Use HTTP rather than opening HTML files directly, since links and asset paths are rooted at `/`.

## Hosting

`wrangler.jsonc` serves the static root. `.assetsignore` includes only the actual website, page directories and local assets. Directory routes support direct loads and refreshes. Cloudflare deploys pushes to `main`; branch development does not publish the production site.
