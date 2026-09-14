/* Bauhaus Dessau — Walter Gropius, 1926. The sheet's original model, ported
 * verbatim: workshop glass wing, bridge over the road, north wing, studio
 * tower, assembled by a tower crane that tracks the work. Storey = 36.
 *
 *              N ▲                       plan (not to scale)
 *        ┌──────────┐
 *        │  North   │══bridge══┐            z
 *        │  Wing    │ (road ↓) │  ┌────┐    ↑
 *        └──────────┘      ┌───┴──┤Link│    │
 *                          │ Wksp │─┬──┘    └──→ x
 *                          │ glass│ │Studio (5 st.)
 *                          └──────┘ └────┘ */

import type { SceneDef } from '../engine';

const CRANE = { bx: -40, bz: 170, topY: 308, restYaw: 150, minR: 34, maxR: 192 };

export const dessau: SceneDef = {
  id: 'dessau',
  fit: { width: 560, height: 360, lift: 0.42 },
  build(b) {
    const P = b.box.bind(b);

    /* ground: survey grid, the road the bridge spans, a shadow that grows */
    b.plane({ x: 0, z: 0, w: 1400, d: 1400, cls: 'plane--grid' });
    const road = b.plane({ x: -81, z: 0, w: 48, d: 780, y: -2, cls: 'plane--road' });
    road.style.borderLeft = road.style.borderRight = '1px solid var(--scene-edge)';
    const shade = b.plane({ x: 0, z: 0, w: 520, d: 340, y: -3, cls: 'plane--shade' });

    /* foundation pads */
    P({ x: 95, y: 4, z: 35, w: 182, h: 8, d: 142, mat: 'conc', at: 0.06 });
    P({ x: -175, y: 4, z: -40, w: 122, h: 8, d: 152, mat: 'conc', at: 0.066 });
    P({ x: 150, y: 4, z: -115, w: 72, h: 8, d: 92, mat: 'conc', at: 0.072 });
    P({ x: 130, y: 4, z: -52, w: 82, h: 8, d: 56, mat: 'conc', at: 0.078 });

    /* tower crane (temporary works; tracks the build in tick) */
    P({ x: -40, y: 6, z: 170, w: 48, h: 12, d: 48, mat: 'conc', at: 0.085, off: 0.85, track: false });
    P({ x: -40, y: 158, z: 170, w: 14, h: 304, d: 14, mat: 'peach', at: 0.1, off: 0.84, track: false });
    const craneWrap = b.group('translate3d(-40px,-310px,170px)');
    const craneYaw = b.group('', craneWrap);
    P({ parent: craneYaw, x: 100, y: 6, z: 0, w: 200, h: 9, d: 9, mat: 'peach', at: 0.115, off: 0.83 });
    P({ parent: craneYaw, x: -45, y: 6, z: 0, w: 82, h: 9, d: 11, mat: 'peach', at: 0.115, off: 0.83 });
    P({ parent: craneYaw, x: 0, y: 26, z: 0, w: 9, h: 40, d: 9, mat: 'peach', at: 0.118, off: 0.83 });
    P({ parent: craneYaw, x: -80, y: -4, z: 0, w: 22, h: 18, d: 18, mat: 'conc', at: 0.12, off: 0.83 });
    const trolley = b.group('', craneYaw);
    P({ parent: trolley, x: 0, y: -1, z: 0, w: 12, h: 6, d: 12, mat: 'dark', at: 0.13, off: 0.82 });
    const cableWrap = b.group('', trolley, 'grp cablewrap');
    cableWrap.innerHTML = '<div class="cline"></div><div class="cline x90"></div>';
    b.register(cableWrap, 0.135, 0.82);
    const hookHost = b.group('', cableWrap);
    P({ parent: hookHost, x: 0, y: -3, z: 0, w: 9, h: 7, d: 9, mat: 'steel', at: 0.14, off: 0.82 });

    /* workshop wing: the glass one (frame first, skin later) */
    P({ x: 22, y: 60, z: -16, w: 12, h: 104, d: 12, mat: 'steel', at: 0.15 });
    P({ x: 168, y: 60, z: -16, w: 12, h: 104, d: 12, mat: 'steel', at: 0.165 });
    P({ x: 22, y: 60, z: 86, w: 12, h: 104, d: 12, mat: 'steel', at: 0.18 });
    P({ x: 168, y: 60, z: 86, w: 12, h: 104, d: 12, mat: 'steel', at: 0.195 });
    P({ x: 95, y: 44, z: 35, w: 166, h: 8, d: 126, mat: 'slab', at: 0.22 });
    P({ x: 95, y: 80, z: 35, w: 166, h: 8, d: 126, mat: 'slab', at: 0.25 });
    P({ x: 95, y: 116, z: 35, w: 176, h: 8, d: 136, mat: 'slab', at: 0.28 });

    /* bridge over the road, on dark pilotis */
    P({ x: -25, y: 20, z: -18, w: 8, h: 40, d: 8, mat: 'dark', at: 0.3 });
    P({ x: -25, y: 20, z: 8, w: 8, h: 40, d: 8, mat: 'dark', at: 0.31 });
    P({ x: -90, y: 20, z: -18, w: 8, h: 40, d: 8, mat: 'dark', at: 0.32 });
    P({ x: -90, y: 20, z: 8, w: 8, h: 40, d: 8, mat: 'dark', at: 0.33 });
    P({ x: -55, y: 44, z: -5, w: 130, h: 8, d: 50, mat: 'slab', at: 0.35 });
    P({ x: -55, y: 76, z: -5, w: 130, h: 8, d: 50, mat: 'slab', at: 0.37 });
    P({ x: -55, y: 108, z: -5, w: 134, h: 8, d: 54, mat: 'slab', at: 0.39 });

    /* north wing frame */
    P({ x: -212, y: 60, z: -92, w: 12, h: 104, d: 12, mat: 'steel', at: 0.4 });
    P({ x: -138, y: 60, z: -92, w: 12, h: 104, d: 12, mat: 'steel', at: 0.415 });
    P({ x: -212, y: 60, z: 12, w: 12, h: 104, d: 12, mat: 'steel', at: 0.43 });
    P({ x: -138, y: 60, z: 12, w: 12, h: 104, d: 12, mat: 'steel', at: 0.445 });
    P({ x: -175, y: 44, z: -40, w: 106, h: 8, d: 136, mat: 'slab', at: 0.47 });
    P({ x: -175, y: 80, z: -40, w: 106, h: 8, d: 136, mat: 'slab', at: 0.49 });
    P({ x: -175, y: 116, z: -40, w: 116, h: 8, d: 146, mat: 'slab', at: 0.51 });

    /* link (canteen) + studio tower frame */
    P({ x: 100, y: 22, z: -50, w: 8, h: 28, d: 8, mat: 'steel', at: 0.52 });
    P({ x: 160, y: 22, z: -50, w: 8, h: 28, d: 8, mat: 'steel', at: 0.525 });
    P({ x: 130, y: 40, z: -52, w: 76, h: 8, d: 50, mat: 'slab', at: 0.535 });
    P({ x: 128, y: 96, z: -147, w: 10, h: 176, d: 10, mat: 'steel', at: 0.55 });
    P({ x: 172, y: 96, z: -147, w: 10, h: 176, d: 10, mat: 'steel', at: 0.56 });
    P({ x: 128, y: 96, z: -83, w: 10, h: 176, d: 10, mat: 'steel', at: 0.57 });
    P({ x: 172, y: 96, z: -83, w: 10, h: 176, d: 10, mat: 'steel', at: 0.58 });
    P({ x: 150, y: 44, z: -115, w: 56, h: 8, d: 76, mat: 'slab', at: 0.6 });
    P({ x: 150, y: 80, z: -115, w: 56, h: 8, d: 76, mat: 'slab', at: 0.615 });
    P({ x: 150, y: 116, z: -115, w: 56, h: 8, d: 76, mat: 'slab', at: 0.63 });
    P({ x: 150, y: 152, z: -115, w: 56, h: 8, d: 76, mat: 'slab', at: 0.645 });
    P({ x: 150, y: 188, z: -115, w: 62, h: 8, d: 82, mat: 'slab', at: 0.66 });

    /* skins: stucco, ribbons, balconies (no ghosts — finishes) */
    P({ x: -175, y: 60, z: 31, w: 106, h: 104, d: 4, mat: 'stucco', at: 0.585, ghost: false });
    P({ x: -119, y: 60, z: -40, w: 4, h: 104, d: 136, mat: 'stucco', at: 0.6, ghost: false });
    P({ x: -175, y: 28, z: 33.5, w: 94, h: 12, d: 3, mat: 'ribbon', at: 0.62, ghost: false });
    P({ x: -175, y: 64, z: 33.5, w: 94, h: 12, d: 3, mat: 'ribbon', at: 0.63, ghost: false });
    P({ x: -175, y: 100, z: 33.5, w: 94, h: 12, d: 3, mat: 'ribbon', at: 0.64, ghost: false });
    P({ x: -116.5, y: 28, z: -40, w: 3, h: 12, d: 124, mat: 'ribbon', at: 0.625, ghost: false });
    P({ x: -116.5, y: 64, z: -40, w: 3, h: 12, d: 124, mat: 'ribbon', at: 0.635, ghost: false });
    P({ x: -116.5, y: 100, z: -40, w: 3, h: 12, d: 124, mat: 'ribbon', at: 0.645, ghost: false });
    b.plate({ x: -215, y: 14, z: 33.6, w: 56, h: 8, at: 0.65, cls: 'code', html: '<span>N-02 · Fachschule</span>' });
    P({ x: -55, y: 76, z: 22, w: 130, h: 56, d: 4, mat: 'stucco', at: 0.655, ghost: false });
    P({ x: -55, y: 60, z: 24.5, w: 118, h: 12, d: 3, mat: 'ribbon', at: 0.67, ghost: false });
    P({ x: -55, y: 92, z: 24.5, w: 118, h: 12, d: 3, mat: 'ribbon', at: 0.68, ghost: false });
    b.plate({ x: -100, y: 76, z: 24.6, w: 56, h: 8, at: 0.685, cls: 'code', html: '<span>Br-03 · Brücke</span>' });
    P({ x: 150, y: 96, z: -73, w: 56, h: 176, d: 4, mat: 'stucco', at: 0.69, ghost: false });
    P({ x: 181, y: 96, z: -115, w: 4, h: 176, d: 76, mat: 'stucco', at: 0.7, ghost: false });
    for (const [y, at] of [[26, 0.705], [62, 0.71], [98, 0.715], [134, 0.72], [170, 0.725]] as const)
      P({ x: 150, y, z: -70.5, w: 40, h: 11, d: 3, mat: 'ribbon', at, ghost: false });
    for (const [y, at] of [[62, 0.715], [98, 0.72], [134, 0.725], [170, 0.73]] as const)
      P({ x: 189, y, z: -115, w: 14, h: 5, d: 20, mat: 'stucco', at, ghost: false });
    b.plate({ x: 166, y: 14, z: -70.4, w: 56, h: 8, at: 0.735, cls: 'code', html: '<span>St-05 · Prellerhaus</span>' });
    /* workshop curtain wall — the reveal, saved for last */
    P({ x: 30, y: 25, z: 101.5, w: 26, h: 34, d: 3, mat: 'dark', at: 0.7, ghost: false });
    P({ x: 30, y: 46, z: 108, w: 44, h: 5, d: 26, mat: 'stucco', at: 0.705, ghost: false });
    P({ x: 95, y: 65, z: 101, w: 174, h: 106, d: 4, mat: 'glass', at: 0.74, ghost: false });
    P({ x: 183, y: 65, z: 35, w: 4, h: 106, d: 134, mat: 'glass', at: 0.755, ghost: false });
    b.plate({ x: 165, y: 14, z: 103.2, w: 56, h: 8, at: 0.76, cls: 'code', html: '<span>W-01 · Werkstatt</span>' });
    b.plate({ x: 185.6, y: 62, z: 74, ry: 90, w: 18, h: 110, at: 0.77, cls: 'sign',
      html: '<span>B</span><span>A</span><span>U</span><span>H</span><span>A</span><span>U</span><span>S</span>' });

    /* scaffold on the north wing (temporary works) */
    P({ x: -205, y: 65, z: 42, w: 5, h: 130, d: 5, mat: 'steel', at: 0.42, off: 0.78, track: false, ghost: false });
    P({ x: -205, y: 65, z: 56, w: 5, h: 130, d: 5, mat: 'steel', at: 0.43, off: 0.785, track: false, ghost: false });
    P({ x: -145, y: 65, z: 42, w: 5, h: 130, d: 5, mat: 'steel', at: 0.44, off: 0.79, track: false, ghost: false });
    P({ x: -145, y: 65, z: 56, w: 5, h: 130, d: 5, mat: 'steel', at: 0.45, off: 0.795, track: false, ghost: false });
    P({ x: -175, y: 46, z: 49, w: 70, h: 5, d: 24, mat: 'plank', at: 0.47, off: 0.8, track: false, ghost: false });
    P({ x: -175, y: 90, z: 49, w: 70, h: 5, d: 24, mat: 'plank', at: 0.55, off: 0.805, track: false, ghost: false });
    P({ x: -175, y: 65, z: 56, w: 5, h: 120, d: 5, mat: 'steel', at: 0.57, off: 0.8, track: false, ghost: false, rot: 'rotateZ(34deg)' });
    P({ x: 22, y: 10, z: 196, w: 40, h: 8, d: 16, mat: 'plank', at: 0.2, off: 0.79, track: false, ghost: false });
    P({ x: -98, y: 9, z: 202, w: 24, h: 12, d: 18, mat: 'conc', at: 0.24, off: 0.795, track: false, ghost: false });

    /* survey dimension line, at the tallest point */
    P({ x: 205, y: 94, z: -75, w: 2, h: 188, d: 2, mat: 'ink', at: 0.86, ghost: false, track: false });
    P({ x: 205, y: 187, z: -75, w: 16, h: 2, d: 2, mat: 'ink', at: 0.87, ghost: false, track: false });
    P({ x: 205, y: 1, z: -75, w: 16, h: 2, d: 2, mat: 'ink', at: 0.87, ghost: false, track: false });
    b.bill({ x: 205, y: 202, z: -75, label: 'Elev +26.0 m', at: 0.875 });

    /* topping-out beam, with the traditional tree */
    P({ x: 150, y: 196, z: -115, w: 70, h: 8, d: 12, mat: 'mint', at: 0.88, track: false });
    b.bill({ x: 150, y: 208, z: -115, emoji: '🌲', at: 0.88, size: 18 });

    /* crane brain: aim at whatever was most recently placed */
    let yaw = 40, trol = 60, cab = 80;
    const goal = (p: number) => {
      if (p < 0.15 || p > 0.745) return null;
      let t = null;
      for (const g of b.targets) { if (g.at <= p + 0.015) t = g; else break; }
      return t;
    };
    return {
      tick(p, reduced) {
        shade.style.transform = `translate3d(0px,3px,0px) rotateX(90deg) scale(${(0.25 + p * 0.75).toFixed(3)})`;
        shade.style.opacity = String(0.2 + p * 0.8);
        const g = goal(p);
        let yawT: number, trolT: number, cabT: number;
        if (g) {
          const dx = g.x - CRANE.bx, dz = g.z - CRANE.bz, dist = Math.hypot(dx, dz);
          yawT = (Math.atan2(-dz, dx) * 180) / Math.PI;
          trolT = Math.min(CRANE.maxR, Math.max(CRANE.minR, dist));
          cabT = Math.min(260, Math.max(26, CRANE.topY - (g.y + 30)));
        } else { yawT = CRANE.restYaw; trolT = 50; cabT = 60; }
        const dy = ((yawT - yaw + 540) % 360) - 180;
        const k = reduced || p >= 1 ? 1 : 0.08;
        yaw += dy * k; trol += (trolT - trol) * k; cab += (cabT - cab) * k;
        craneYaw.style.transform = `rotateY(${yaw}deg)`;
        trolley.style.transform = `translate3d(${trol}px,2px,0)`;
        cableWrap.style.transform = `scaleY(${(cab / 260).toFixed(4)})`;
        hookHost.style.transform = `scaleY(${(260 / cab).toFixed(4)}) translateY(${cab.toFixed(1)}px)`;
      },
    };
  },
};
