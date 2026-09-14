/* Métropolitain entrance — Hector Guimard, Paris, 1900. Cast-iron stems
 * that rise from a stone kerb and curl into orange lamps, an arched sign
 * between them, and a fan-shaped glass canopy behind. The ironwork is the
 * whole point, and ironwork is line, so the stems, sign and canopy are SVG
 * plates standing in 3D; only the stonework is mass. Original drawing;
 * proportions simplified. */

import type { SceneDef } from '../engine';

const STEM = (mirror: boolean) => `
<svg viewBox="0 0 110 230" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g${mirror ? ' transform="matrix(-1 0 0 1 110 0)"' : ''} fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path class="iron" pathLength="1" stroke-width="7" d="M 52 230 C 40 170, 74 130, 46 82 C 30 54, 50 30, 78 30 C 104 30, 106 62, 84 66 C 72 68, 66 58, 72 50"/>
    <path class="iron thin" pathLength="1" stroke-width="2.5" d="M 58 230 C 50 180, 80 150, 60 110 C 52 94, 56 84, 62 78"/>
    <path class="iron thin" pathLength="1" stroke-width="2" d="M 46 82 C 30 96, 24 116, 30 134 C 34 146, 46 146, 48 136"/>
    <ellipse class="lamp" cx="86" cy="44" rx="11" ry="16" transform="rotate(-18 86 44)"/>
    <ellipse class="lamp-core" cx="86" cy="44" rx="5" ry="8" transform="rotate(-18 86 44)"/>
    <ellipse class="bud" cx="30" cy="134" rx="3" ry="6" transform="rotate(30 30 134)"/>
  </g>
</svg>`;

const ARCH = `
<svg viewBox="0 0 220 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path class="iron" pathLength="1" fill="none" stroke-width="4" stroke-linecap="round" d="M 6 90 C 30 20, 190 20, 214 90"/>
  <path class="iron thin" pathLength="1" fill="none" stroke-width="1.6" d="M 20 90 C 44 40, 176 40, 200 90"/>
  <text class="sign" x="110" y="74" text-anchor="middle" font-size="17" letter-spacing="1.5">MÉTROPOLITAIN</text>
</svg>`;

const CANOPY = `
<svg viewBox="0 0 260 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path class="glass" d="M 0 130 C 0 40, 60 0, 130 0 C 200 0, 260 40, 260 130 Z"/>
  <g class="iron thin" fill="none" stroke-width="1.6">
    <path d="M 130 130 L 130 0"/><path d="M 130 130 L 44 12"/><path d="M 130 130 L 216 12"/>
    <path d="M 130 130 L 8 60"/><path d="M 130 130 L 252 60"/>
    <path d="M 0 130 C 0 40, 60 0, 130 0 C 200 0, 260 40, 260 130"/>
    <path d="M 40 130 C 40 70, 80 40, 130 40 C 180 40, 220 70, 220 130"/>
  </g>
</svg>`;

export const metroEntrance: SceneDef = {
  id: 'metro-entrance',
  fit: { width: 380, height: 330, lift: 0.46 },
  build(b, adjustments) {
    b.root.classList.add('metro');
    b.root.dataset['detail'] = String(adjustments['lineDetail'] ?? 'full');
    const P = b.box.bind(b);
    b.plane({ x: 0, z: 0, w: 1200, d: 1200, cls: 'plane--grid' });

    /* stone: a shallow platform, two kerb plinths, a pair behind */
    P({ x: 0, y: 3, z: 10, w: 230, h: 6, d: 130, mat: 'stucco', at: 0.04, ghost: false, track: false, radius: 1 });
    P({ x: -78, y: 12, z: 30, w: 34, h: 12, d: 34, mat: 'conc', at: 0.1, ghost: false, track: false, radius: 1 });
    P({ x: 78, y: 12, z: 30, w: 34, h: 12, d: 34, mat: 'conc', at: 0.14, ghost: false, track: false, radius: 1 });
    P({ x: -66, y: 12, z: -44, w: 28, h: 12, d: 28, mat: 'conc', at: 0.18, ghost: false, track: false, radius: 1 });
    P({ x: 66, y: 12, z: -44, w: 28, h: 12, d: 28, mat: 'conc', at: 0.2, ghost: false, track: false, radius: 1 });
    /* the stair well: a dark opening in the platform, the reason for the entrance */
    P({ x: 0, y: 6.5, z: -6, w: 110, h: 1, d: 70, mat: 'dark', at: 0.08, ghost: false, track: false, radius: 0 });

    /* rear stems hold the canopy */
    b.svgPlate({ x: -66, y: 18 + 92, z: -44, w: 92, h: 184, svg: STEM(false), at: 0.3 });
    b.svgPlate({ x: 66, y: 18 + 92, z: -44, w: 92, h: 184, svg: STEM(true), at: 0.36 });
    /* front stems, taller, carry the lamps and the sign */
    b.svgPlate({ x: -78, y: 18 + 110, z: 30, w: 110, h: 220, svg: STEM(false), at: 0.46 });
    b.svgPlate({ x: 78, y: 18 + 110, z: 30, w: 110, h: 220, svg: STEM(true), at: 0.54 });
    /* the sign arches between the front stems */
    b.svgPlate({ x: 0, y: 118 + 45, z: 36, w: 220, h: 90, svg: ARCH, at: 0.7 });
    /* the canopy: a glass fan tilted back over the stair */
    b.svgPlate({ x: 0, y: 214, z: -50, w: 260, h: 130, rx: -62, svg: CANOPY, at: 0.84 });
  },
  update(b, adjustments) {
    b.root.dataset['detail'] = String(adjustments['lineDetail'] ?? 'full');
    return true;
  },
};
