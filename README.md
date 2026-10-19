# Rishabh Doshi’s portfolio

The home page is one portfolio with two faces and a line you drag between them. Left of the line is the hand-made 2025 Framer site, live from its archive. Right of it is the same page made with an AI in the room, in Felt, element for element: the nav, the typed line (copied character by character from the 2025 frame, so both type in step), About | See my work as felt keys, a felt square in place of the portrait that runs the three experiments, the three work rows, a charcoal Experiments band in place of the archive grid (the three experiments, How I work now, and a card that slides the line across to the 2025 archives) and the footer. The felt face uses the archive's own geometry and switches layout at the same widths, measured on the page with container queries, and where the two faces carry different words a felt block takes its 2025 twin's height in script, so every part sits on its twin. Felt is one grotesk (Host Grotesk), warm grey wool `#E7E4DE`, a charcoal band and one signal, with fibre texture, stitched edges and controls that press in. Since design system 0.7 the signal is a raspberry-to-brick gradient (`#D2386B` to `#C8312F`) under white text, with a solid `#CD354D` for dots, lines and the typed-line caret. The 2025 face keeps its own coral, `#FF5E7C`, because it is the archive. The line's tags read Without AI and With AI; hover it, or tab to it, and each side frosts over and names itself. Under 720px the line becomes a Without AI / With AI toggle.

All three case studies use the same split to mean then and now: the 2025 study on the left, and the same project re-cut in felt on the right. They live at `/shipment/`, `/genai/` and `/healthcare/`. The 2025 face is cut where the re-cut ends and links to the full archived study.

The version history that opened the site until October 2026 now lives at `/versions/`, linked from the footer as “Every version of this page since 2025”. Old links to `/#t0` and the other stops redirect there.

## How the split works

`split.js` runs both pages. Face A is a same-origin iframe of the archive, sized to its content so the page scrolls as one document. Face B is clipped from the left with `clip-path`, and a registered `--split` property drives both the clip and the divider. Where you leave the line carries over to every page, and so does the phone toggle: the position is kept in `localStorage` under `split-portfolio`, applied by a one-line inline script before first paint, and only your own moves are saved. The knob is a focusable `role="separator"`: arrow keys move it 2% (Shift for 10%), Page Up and Page Down 10%, Home and End snap to a face. When keyboard focus lands on the hidden side, the line moves to show it.

The archive files stay frozen. At runtime the script rewrites the archive’s viewport units against this window, because the frame grows to fit its content, and points its links at the top window. `/versions/2025-framer/` maps to `/` and the shipment study maps to `/shipment/`. Links within the 2025 home page scroll this page.

Without JavaScript the page is Face B alone, with every link working. With reduced motion, Face B holds still on the rose frame and the 2025 typewriter shows its whole phrase.

`portfolio.js` runs the felt face of the home page: it mirrors the typed line, cycles the felt square and keeps the twin heights. The felt textures are two small tiling SVGs in `felt/`, used as background images so the grain costs one rasterisation, not a page-sized filter.

## Fonts and the shared design system

Host Grotesk is a vendored latin variable subset in `fonts/`, under the SIL Open Font License 1.1 with its licence beside it, from Google Fonts on 18 October 2026. The glass pane's “Not AI” uses the archive’s own Playfair Display file.

The home page and case studies do not load `@doshi-experiments/design-system`, so they have no shared header or appearance control and have a single light appearance. They mirror the design system's signal in `portfolio.css` instead: `--sig` (solid), `--sig-grad` (the gradient), `--on-sig` (white text and icons on it), `--sig-tint` (selection) and `--focus` (the link red `#A22826`). Change these together with any design-system signal change. On the charcoal preview screens `--sig` switches to the dark-mode red `#E89D9C`, so lines and dots there stay visible.

Focus rings use `--focus`, which reaches at least 3:1 on oat; the bright signal does not. Cards and next links draw the ring as well as lifting, and the split knob's ring sits on a light halo so it reads over the black 2025 face and the oat face alike.

The timeline at `/versions/` loads the 0.7.0 snapshot in `design-system/`, which stays immutable and checked by CI. It follows the System appearance like the other sites, and its version slider's thumb is the signal with a white rim. Each archived version under `versions/` keeps the snapshot it shipped with.

## Preview and deploy

Serve the repository root with a local HTTP server, for example `python3 -m http.server 8788`. JavaScript modules need HTTP rather than opening the HTML as a file.

`node tools/check-links.mjs` verifies that every local reference resolves and that each archive only points inside itself, home, or to the version history. CI runs it alongside an integrity check of every `design-system/release.json`.

Cloudflare deploys pushes to `main`. `wrangler.jsonc` serves the root asset directory, and `.assetsignore` includes only the site, the fonts, the shared design assets and `versions/`. There is no build command.
