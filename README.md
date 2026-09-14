# portfolio-landing

[rishabhdoshi.com](https://rishabhdoshi.com) — one portfolio, twelve design
movements. The same content (name, positioning, process, the three live
experiments, contact) rendered through twelve art directions, each with its
own composition, type, spacing, framing, ornament, and a CSS-3D scene in the
hero. Swiss International Typographic Style is the default.

**Status: Phases 0–2 complete, paused at Gate A for visual review.** Three
directions are built — Swiss, Art Nouveau, Brutalism — and the remaining nine
are in scope, not started. The explorer, Tune/Remix UI and persistence UI
arrive in Phase 3; the engine beneath them (atomic apply, persistence, scene
system, first-paint boot) is done and tested. See
`~/.claude/plans/plan-for-this-jazzy-moth.md` for the full plan.

The previous under-construction sheet (the scroll-driven Bauhaus model) is
archived verbatim at [`/blueprint/`](public/blueprint/index.html). It keeps
its own light/dark toggle and still reads and writes the `sheet-theme`
cookie; the new homepage does neither — the twelve palettes are light by
design, and the two sibling sites fall back safely without the cookie.

## Running it

```
npm install
npm run dev              # http://localhost:4321
npm run dev:fixtures     # also serves /dev/gate (interactive preview) and /dev/long-form
npm run build            # dist/  (DEV_FIXTURES=1 npm run build to include the fixtures)
npm run check            # astro check + tools type-check + contrast (every pair, every direction)
npm run sheet -- --gate  # Swiss / Art Nouveau / Brutalism × 390/1440 × scene on/off → tools/out/sheet.html
npm run firstpaint       # persisted non-default direction with delayed / failed CSS
npm run switching        # rapid switching, leak cycle, scroll anchor, Reduce effects, blocked fonts, Tune paths
npm run peek -- brutalism 390 1200   # a quick viewport shot into tools/out/shots/
```

The screenshot tools use Playwright with the installed Google Chrome
(`channel: 'chrome'`), falling back to Playwright's Chromium if present. They
run against `dist/`, so build first.

## Shape

```
src/design/      schema (typed directions, recipes, controls), colour maths, the resolver
src/content/     site.ts (the content), directions/<id>.ts (+ .education.ts, server-only)
src/styles/      base · components · scene · directions/<id>.css (composition per direction)
src/client/      boot.js (pre-paint), engine.ts (atomic apply), scene/ (CSS-3D engine + scenes),
                 directions/<id>.ts (decorative markup), persistence, fonts, scroll anchor
src/components/  the semantic skeleton — identical reading order in every direction
src/fixtures/    long-form.md, development only
tools/           contrast · sheet · firstpaint · switching · lib/
```

A direction is data: a palette (with measured contrast roles), a type pairing,
a recipe of finite enums, bounded controls, a scene reference (specific work,
analogy, or original interpretation — the caption is generated from it), and
educational copy. `resolve()` turns direction + adjustments into custom
properties and `data-*` attributes; direction CSS keys on those. Decorative
markup goes only into `aria-hidden` slots; the scene caption and Rebuild
control sit outside the hidden geometry.

## Fonts

Self-hosted from the pinned `@fontsource` packages through Astro's local font
provider (hashed files, generated `@font-face`, metric-matched fallbacks).
Only Latin subsets, only the variable `wght` files. Measured sizes:

| Face | KB | Face | KB |
|---|---|---|---|
| Inter (var) | 47.1 | Cormorant Garamond (var) + italic | 36.8 + 38.3 |
| Source Serif 4 (var) + italic | 49.6 + 50.3 | Josefin Sans (var) | 27.9 |
| Source Sans 3 (var) | 28.1 | Jost (var) | 26.0 |
| IBM Plex Sans (var) | 44.6 | Oswald (var) | 27.8 |
| IBM Plex Mono 400 | 14.4 | Space Grotesk (var) | 21.8 |
| Archivo Black | 18.2 | | |

Only the active direction's faces are requested; a switch waits at most
2.5 s for them and otherwise proceeds on the fallbacks.

## Payload (brotli, measured on the Gate A build)

| | KB |
|---|---|
| Initial Swiss visit: HTML 7.7 + critical CSS 4.9 + JS 9.5 + scene 0.6 + Inter 47.1 | **≈ 70** |
| + Art Nouveau: CSS 1.7 + decorations 0.8 + scene 1.0 + Cormorant 75.1 + Source Sans 28.1 | ≈ 107 |
| + Brutalism: CSS 1.3 + scene 0.6 + Archivo Black 18.2 + Plex Sans 44.6 + Plex Mono 14.4 | ≈ 79 |

The previous page transferred 15.6 KB. Budgets from the plan: initial ≤ 150 KB,
each additional direction ≤ 180 KB — both hold with margin.

## Deploy

Not yet reconfigured. The site now builds to `dist/`; the Cloudflare Worker
(`wip`) currently uploads the repo root with no build step, which is the old
page's shape. Wiring the build command and a `wrangler.jsonc` is Phase 5 and
happens only when deployment is explicitly approved.
