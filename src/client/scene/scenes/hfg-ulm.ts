/* Hochschule für Gestaltung Ulm — Max Bill, 1955. An analogy: Swiss style
 * is a graphic tradition with no building of its own, so the campus of the
 * school Bill founded stands in. Terraced concrete blocks stepping down a
 * hill, ribbon windows, flat roofs. Original model, simplified; drawn as a
 * 1px plan in the Swiss treatment, so the composition is all it has. */

import type { SceneDef } from '../engine';

export const hfgUlm: SceneDef = {
  id: 'hfg-ulm',
  fit: { width: 620, height: 300, lift: 0.4 },
  build(b) {
    const P = b.box.bind(b);
    b.plane({ x: 0, z: 0, w: 1400, d: 1400, cls: 'plane--grid' });

    /* the hill: three terraces rising to the right */
    P({ x: -150, y: 3, z: 40, w: 280, h: 6, d: 200, mat: 'conc', at: 0.04, track: false });
    P({ x: 60, y: 9, z: 30, w: 200, h: 18, d: 220, mat: 'conc', at: 0.07, track: false });
    P({ x: 220, y: 15, z: 20, w: 140, h: 30, d: 200, mat: 'conc', at: 0.1, track: false });

    /* student housing: a row of stepped blocks on the lowest terrace */
    for (let i = 0; i < 3; i++) {
      const x = -250 + i * 78;
      P({ x, y: 6 + 22, z: 90, w: 64, h: 44, d: 60, mat: 'stucco', at: 0.14 + i * 0.05 });
      P({ x, y: 6 + 46, z: 90, w: 70, h: 4, d: 66, mat: 'slab', at: 0.17 + i * 0.05 });     // flat roof, overhang
      P({ x, y: 6 + 30, z: 121, w: 52, h: 8, d: 2, mat: 'ribbon', at: 0.2 + i * 0.05, ghost: false, track: false });
    }

    /* workshop wing: long, low, on the middle terrace */
    P({ x: 30, y: 18 + 30, z: 40, w: 250, h: 60, d: 72, mat: 'stucco', at: 0.32 });
    P({ x: 30, y: 18 + 62, z: 40, w: 258, h: 4, d: 78, mat: 'slab', at: 0.36 });
    for (let i = 0; i < 6; i++)
      P({ x: -70 + i * 40, y: 18 + 42, z: 77, w: 30, h: 12, d: 2, mat: 'ribbon', at: 0.38 + i * 0.02, ghost: false, track: false });
    P({ x: 30, y: 18 + 14, z: 77, w: 250, h: 10, d: 2, mat: 'ribbon', at: 0.4, ghost: false, track: false });

    /* main building: three storeys on the upper terrace, the long window band */
    P({ x: 220, y: 30 + 54, z: 10, w: 130, h: 108, d: 96, mat: 'stucco', at: 0.5 });
    P({ x: 220, y: 30 + 110, z: 10, w: 140, h: 5, d: 104, mat: 'slab', at: 0.56 });
    for (const [y, at] of [[30 + 22, 0.58], [30 + 58, 0.61], [30 + 94, 0.64]] as const) {
      P({ x: 220, y, z: 59, w: 118, h: 12, d: 2, mat: 'ribbon', at, ghost: false, track: false });
      P({ x: 286, y, z: 10, w: 2, h: 12, d: 84, mat: 'ribbon', at: at + 0.01, ghost: false, track: false });
    }
    /* stair tower and chimney: the one vertical against all that horizontal */
    P({ x: 172, y: 30 + 76, z: -50, w: 28, h: 152, d: 28, mat: 'conc', at: 0.7 });
    P({ x: 300, y: 30 + 100, z: -20, w: 10, h: 200, d: 10, mat: 'dark', at: 0.76, track: false });

    /* the bridge corridor linking workshop and main building */
    P({ x: 140, y: 18 + 40, z: 20, w: 40, h: 18, d: 30, mat: 'stucco', at: 0.8 });
    P({ x: 140, y: 18 + 50, z: 20, w: 46, h: 3, d: 34, mat: 'slab', at: 0.84 });

    /* survey line at the tallest point */
    P({ x: 320, y: 30 + 100, z: 40, w: 2, h: 200, d: 2, mat: 'ink', at: 0.9, ghost: false, track: false });
    P({ x: 320, y: 30 + 199, z: 40, w: 14, h: 2, d: 2, mat: 'ink', at: 0.92, ghost: false, track: false });
    P({ x: 320, y: 31, z: 40, w: 14, h: 2, d: 2, mat: 'ink', at: 0.92, ghost: false, track: false });
    b.bill({ x: 320, y: 30 + 214, z: 40, label: 'Kuhberg · 1955', at: 0.95 });
  },
};
