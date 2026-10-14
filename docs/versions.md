# Earlier versions of this page

The landing page opens with its own version history. Each stop is an archived copy of the page as it was, served from `versions/<slug>/` and shown as a live scale model inside the frame; the viewer opens the same copy at full size. Archives are frozen: the only edits allowed are the ones listed here.

| Stop | Directory | Source | Edits |
| --- | --- | --- | --- |
| 2025 | `versions/2025-framer/` | branch `recreate/framer-portfolio` at `ae6dfb2` (deployable files only, not its `design-system/`, docs or repo metadata) | every root-absolute path prefixed with `/versions/2025-framer`; the archive bar on all seven pages |
| August 2026 | `versions/2026-08-blueprint/` | `12b0583:index.html` (1 August 2026, self-contained) | the archive bar; `noindex` |
| September 2026 | `versions/2026-09-astro/` | branch `art-direction-system` at `f72d109`, never deployed; `swiss-1280.webp` and `swiss-390.webp` are screenshots of its build | none (screenshots only) |
| October 2026 | `versions/2026-10-blue/` | `ddaa35a` (4 October 2026): `index.html`, `portfolio.css` and its own `design-system/` 0.5.0 snapshot | six root-absolute paths prefixed with `/versions/2026-10-blue`; the archive bar; `noindex`; the fixed header moved below the bar |

Archive rules:

- Paths are prefixed, never relativised, so a copy keeps working wherever a page sits in it. `tools/check-links.mjs` fails if a file under `versions/<slug>/` points outside `/versions/<slug>/` (except the bar's link home), or if any local reference is missing. CI runs it.
- The archive bar is a sticky strip at the top of each archived page with a link back to its stop on the current page (`/#t0`, `/#t1`, `/#t3`). A one-line script hides it when the page is framed, so neither the miniature nor the viewer shows it.
- Archived `design-system/` snapshots are byte-identical to their source commit; CI checks every `**/design-system/release.json`, not just the live one.
- The Framer archive ships its own fonts (Playfair Display, Poppins, Amiko). The identity's "Commissioner only" rule applies to the live site; an archive keeps whatever it shipped with.
- The 2025 case-study pages stay indexable because they are the only case studies on the site. The two archived landing pages are `noindex` since they duplicate `/`.

## Adding a stop

1. Copy the deployable files of the version into `versions/<yyyy-mm-slug>/`. For a commit: `git archive <sha> <files> | tar -x -C versions/<slug>`. Keep any `design-system/` snapshot untouched.
2. Prefix root-absolute references (`href="/`, `src="/`, `data-screen="/`, `url("/`, `from '/`, `path: '/`) with `/versions/<slug>`, skipping `//`, `#…` and anything with a scheme.
3. Insert, after `<meta charset>`, `<script>if(self!==top)document.documentElement.dataset.framed=''</script><style>[data-framed] .archive-bar{display:none}</style>`, and as the first child of `<body>` the archive bar (copy it from an existing archive, change the date and the `/#t…` link).
4. Add a `.panel.stop` section to `index.html` with `data-stop` (the heading), `data-src` (the archive URL, or `data-kind="image"` with `data-src`/`data-src-narrow` for a screenshot), the caption and the "Open the … version" link; add a tick label and a `.beat` in the runway, and raise the slider's `max`.
5. Run `node tools/check-links.mjs`, then preview at 320, 390, 768 and 1440 in both appearances and with reduced motion.

Screenshots for a version that cannot be served: serve its build locally, then
`playwright screenshot --browser chromium --viewport-size=1280,1800 --wait-for-timeout=4000 <url> shot.png` (and `390,1600`), and `cwebp -q 82 shot.png -o versions/<slug>/<name>.webp`.
