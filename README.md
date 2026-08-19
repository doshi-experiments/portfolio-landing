# portfolio-landing

Under-construction landing page for **rishabhdoshi.com** — a plush scale model
of the Bauhaus Dessau that assembles itself as you scroll. Every beam is a
`<div>` in 3D space; the engine is one `requestAnimationFrame` loop and some
trig. No frameworks, no libraries, no images.

Styled with [Feltwork](https://github.com/doshi-experiments/feltwork) — "Dieter
Rams meets plushie."

## Build

```
npm install
npm run build      # src/index.html -> dist/
npm run serve      # http://localhost:8099
```

This page had no build step, and its conceit is that you can read the source.
That is still true of what ships: `feltwork build --mode inline` writes the
tokens and the SVG filter defs *into* the file, so `dist/index.html` is a
single self-contained document with no runtime dependency. The build exists
only so the design tokens are authored once instead of copy-pasted into four
repos and left to drift.

**Cloudflare Pages needs its settings updated** — this project previously had
no build command:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |

## The model, in felt

The model was always real 3D — every piece is placed with actual x/y/z — so
moving to Feltwork's projection was a camera change, not a rebuild.

- **True isometric.** The old perspective camera (`perspective: 1500px`, pitch
  −26°, yaw −29°) is replaced by `rotateX(-35.264deg) rotateY(-45deg)` with no
  `perspective` at all. That is the angle at which all three axes foreshorten
  equally in a Y-up scene.
- **Shading is a table lookup, not maths.** Each material was already a
  three-stop token set (`--ft` top / `--ff` front / `--fs` side) consumed by
  exactly two CSS rules — which is precisely Feltwork §6's face mapping. Every
  face now takes a *measured* ramp stop: top `-light`, left the base, right
  `-shadow`. No `brightness()`, no mixing toward black.
- **Felt physics.** Faces are rounded hard (a cube should read stuffed, not
  machined), carry the same baked grain tile the headlines use at 7%, and cast
  a soft contact shadow and nothing longer.
- **No gloss.** The curtain wall used to be translucent blue glass. Felt is
  matte, so it is now a lighter panel of the same wool; topping out lights it
  one stop up the ramp instead of switching on an interior glow.

## What was retired

The drawing-set furniture went, because once the material stops being ink on
a drawing it is furniture: the drafting grid across the viewport, the corner
registration marks, the survey readout, the Drawn By / Sheet / Rev title
block, and "Do Not Scale Drawing · Dimensions Are a Vibe". The numbered
structure stayed — `01 / Empathize`, `02 / Design`, `03 / Iterate` — because a
fixed sequence the visitor reads top to bottom is exactly what Feltwork's rail
is for.

The topping-out confetti was emoji; §13 rules emoji out as icons, so the burst
is now scraps of the same felt the model is built from, and the tree hoisted
onto the finished frame is two rounded chips rather than 🌲.

## Notes

- The light/dark choice rides a `sheet-theme` cookie scoped to
  `.rishabhdoshi.com`, so it follows the visitor across the portfolio, the
  experiments index and the apps. Feltwork's dark theme flips the ground only —
  the felt is unchanged, because a felt object does not change colour when you
  move it onto a dark table.
- `prefers-reduced-motion` kills the drop transitions, the blinking cursor and
  the confetti.
- `<noscript>` carries the bio and every contact link, so the page still says
  who it belongs to without JavaScript.
