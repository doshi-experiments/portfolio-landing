# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Rishabh Doshi's portfolio at rishabhdoshi.com. Static, no build step, deployed by Cloudflare (Workers static assets) on push to `main`. `README.md` explains the split in detail; `docs/versions.md` covers the version history. Author commits as `doshi-experiments <311927837+doshi-experiments@users.noreply.github.com>`.

## Commands

```sh
python3 -m http.server 8788        # ES modules and the iframe need HTTP, not file://
node tools/check-links.mjs         # every local reference resolves; archives stay self-contained
```

CI also re-verifies the SHA-256 hashes of every `design-system/release.json` (the live snapshot and each archive's).

## Architecture

- The home page and the three case studies (`/shipment/`, `/genai/`, `/healthcare/`) are a **split**: Face A is a same-origin iframe of the frozen 2025 Framer archive (`versions/2025-framer/`), Face B is the same page re-made in Felt, clipped by `clip-path` from a registered `--split` property. `split.js` runs it: the draggable `role="separator"` knob, the viewport-unit shim for the archive, link rerouting to the top window, and the position saved in `localStorage` under `split-portfolio` (applied before first paint by an inline script). `portfolio.js` runs the Felt face of the home page.
- `portfolio.css` styles the Felt faces. These pages do **not** load the design system; they mirror its signal tokens: `--sig`, `--sig-grad`, `--on-sig`, `--sig-tint`, `--focus`. Change them together with any design-system signal change. Inside the charcoal preview screens `--sig` is the dark-mode red `#E89D9C`.
- `/versions/` is the version timeline and the only page here that loads the design system, from the committed snapshot in `design-system/`. Each `versions/<release>/` is a frozen archive with its own snapshot.

## Invariants that are easy to break

- Never edit archive files under `versions/` or any `design-system/` snapshot by hand; CI checks the hashes and `check-links` checks archive links.
- `.assetsignore` is an allow-list. New top-level files are not deployed unless listed; repository files such as `README.md` and this file stay private.
- The 2025 face keeps its own coral `#FF5E7C`; only the Felt face follows the design system's signal.
- Focus rings use `--focus` (`#A22826`, at least 3:1 on oat), never the bright signal.
- Site-owned content opens in the same tab. Only external profiles open new tabs, and say so.
- Copy follows the design system's `docs/identity.md`. Every claim on the case studies must trace to the 2025 originals; never invent clients, outcomes or numbers.
