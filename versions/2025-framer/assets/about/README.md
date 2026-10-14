# About page assets

The artwork and content are reproduced from Rishabh Doshi's public portfolio at
https://orange-pentagon-065454.framer.app/about, inspected October 6–7, 2026.

- Tool icons: local PNG captures of the original site's SVG tool tiles, at 2× scale.
- `dog.json`: the original Lottie animation from
  https://framerusercontent.com/assets/L3oQCqBQUa8vnuegobdjVk.lottie.
  The published animation references a missing `images/img_0.png` raster matte.
  Its existing vector head outline replaces that missing matte in this copy,
  keeping the illustration self-contained without a failing image request.
- `dog.svg`: a static frame rendered from the local animation, used before the
  player loads and when JavaScript is unavailable.
- `lottie-light.min.js`: Lottie Web 5.13.0's SVG light player, downloaded from
  https://cdn.jsdelivr.net/npm/lottie-web@5.13.0/build/player/lottie_light.min.js.
  Its MIT license is preserved in `lottie-LICENSE.md`. No Framer runtime is used.

Motion can be paused using the control below the dog. It respects the system's
reduced-motion preference and pauses when the illustration is offscreen.
