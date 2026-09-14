/* Habitat 67 — Moshe Safdie, Montréal, 1967. Prefabricated concrete
 * modules stacked so that each roof is the terrace of the one above; the
 * pile steps back as it rises, and steps sideways too, so no two faces
 * line up. Fewer modules than the real thing, and the terraces are the
 * same simplified box; the stagger is the idea. */

import type { SceneDef } from '../engine';

const MOD = { w: 64, h: 40, d: 60 };

export const habitat67: SceneDef = {
  id: 'habitat-67',
  fit: { width: 560, height: 320, lift: 0.44 },
  build(b, adjustments) {
    b.root.classList.add('habitat');
    b.root.dataset['edge'] = String(adjustments['edgeWeight'] ?? 0);
    const P = b.box.bind(b);
    b.plane({ x: 0, z: 0, w: 1400, d: 1400, cls: 'plane--grid' });
    /* the podium: a long slab the pile sits on */
    P({ x: 0, y: 5, z: 10, w: 470, h: 10, d: 230, mat: 'b', at: 0.04, ghost: false, track: false, radius: 0 });

    /* rows: [count, x offset, z offset, material] — each row steps back and sideways */
    const rows: [number, number, number, string][] = [
      [6, -180, 40, 'a'], [5, -130, -10, 'a'], [4, -100, 30, 'b'], [3, -40, -20, 'a'], [2, 10, 24, 'b'], [1, 60, -12, 'a'],
    ];
    let at = 0.08;
    rows.forEach(([count, x0, z0, mat], row) => {
      for (let i = 0; i < count; i++) {
        const x = x0 + i * (MOD.w + 10);
        const z = z0 + (i % 2 ? -14 : 14);
        const y = 10 + row * (MOD.h + 4) + MOD.h / 2;
        P({ x, y, z, w: MOD.w, h: MOD.h, d: MOD.d, mat, at, ghost: false, radius: 0 });
        /* a window opening on the front face and a terrace rail on the roof */
        P({ x: x - 8, y, z: z + MOD.d / 2 + 1, w: 26, h: 18, d: 2, mat: 'dark', at: at + 0.02, ghost: false, track: false, radius: 0 });
        if (row < rows.length - 1)
          P({ x, y: y + MOD.h / 2 + 4, z: z + MOD.d / 2 - 2, w: MOD.w, h: 8, d: 2, mat: 'c', at: at + 0.03, ghost: false, track: false, radius: 0 });
        at += 0.038;
      }
    });

    /* the lift and stair core: one tall plain shaft at the back */
    P({ x: 150, y: 10 + 140, z: -70, w: 40, h: 280, d: 40, mat: 'c', at: 0.9, ghost: false, radius: 0 });
    /* survey line */
    P({ x: 230, y: 10 + 140, z: 40, w: 2, h: 280, d: 2, mat: 'ink', at: 0.95, ghost: false, track: false });
    P({ x: 230, y: 10 + 279, z: 40, w: 14, h: 2, d: 2, mat: 'ink', at: 0.96, ghost: false, track: false });
    P({ x: 230, y: 11, z: 40, w: 14, h: 2, d: 2, mat: 'ink', at: 0.96, ghost: false, track: false });
    b.bill({ x: 230, y: 10 + 294, z: 40, label: 'Cité du Havre · 1967', at: 0.98 });
  },
  update(b, adjustments) {
    b.root.dataset['edge'] = String(adjustments['edgeWeight'] ?? 0);
    return true;
  },
};
