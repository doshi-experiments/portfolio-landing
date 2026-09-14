/* The scene engine — the sheet's CSS-3D builder, made mountable.
 *
 * World coords: x → right, y → up (negated for CSS), z → viewer. A scene
 * is data plus a build function that places pieces with `at` (0–1) marking
 * when each appears along the assembly. The engine owns the camera, the
 * timeline (one RAF loop that runs *only* while assembling), and teardown.
 * Opacity animates on leaf faces only — opacity on a preserve-3d parent
 * flattens the scene, the classic CSS-3D landmine. */

import type { Adjustments, SceneAssembly, SceneId, SceneTreatment } from '@design/schema';

export interface BoxOpts {
  x: number; y: number; z: number; w: number; h: number; d: number;
  mat: string; at: number; off?: number; rot?: string; parent?: HTMLElement;
  ghost?: boolean; track?: boolean; radius?: number;
}
export interface BillOpts { x: number; y: number; z: number; emoji?: string; label?: string; at: number; off?: number; size?: number }
export interface PlateOpts { x: number; y: number; z: number; ry?: number; w: number; h: number; html: string; at: number; cls?: string }
export interface SvgPlateOpts { x: number; y: number; z: number; rx?: number; ry?: number; rz?: number; w: number; h: number; svg: string; at: number; off?: number; cls?: string; parent?: HTMLElement }
export interface PlaneOpts { x: number; z: number; w: number; d: number; y?: number; cls: string; at?: number }

export interface Target { x: number; y: number; z: number; at: number }
export interface Piece { el: HTMLElement; at: number; off?: number }

export interface Builder {
  box(o: BoxOpts): HTMLElement;
  bill(o: BillOpts): HTMLElement;
  plate(o: PlateOpts): HTMLElement;
  svgPlate(o: SvgPlateOpts): HTMLElement;
  plane(o: PlaneOpts): HTMLElement;
  group(transform: string, parent?: HTMLElement, cls?: string): HTMLElement;
  register(el: HTMLElement, at: number, off?: number): void;
  readonly root: HTMLElement;
  readonly targets: Target[];
}

export interface BuildResult {
  /** Called every frame during assembly with progress 0–1 (and once at 1). */
  tick?: (p: number, reduced: boolean) => void;
}

export interface SceneDef {
  id: SceneId;
  /** Bounding size in scene units at scale 1; `lift` = fraction of height
   *  to shift the pivot down so the model sits centred (default 0.5). */
  fit: { width: number; height: number; lift?: number };
  build(b: Builder, adjustments: Adjustments): BuildResult | void;
  /** Regenerate the parts of the geometry a control changed. Return false
   *  (or omit) to ask for a full remount instead. */
  update?(b: Builder, adjustments: Adjustments): boolean;
}

export interface MountOptions {
  camera: { yaw: number; pitch: number; scale: number };
  treatment: SceneTreatment;
  assembly: SceneAssembly;
  assembleMs: number;
  reduced: boolean;
  adjustments: Adjustments;
}

export interface SceneHandle {
  readonly id: SceneId;
  assemble(): Promise<void>;
  settle(): void;
  rebuild(): Promise<void>;
  update(adjustments: Adjustments): void;
  teardown(): void;
  readonly assembled: boolean;
}

/* ── the builder ────────────────────────────────────────────── */
function makeBuilder(root: HTMLElement, pieces: Piece[], targets: Target[]): Builder {
  let idx = 0;
  const stagger = () => (idx++ % 4) * 45 + 'ms';

  function face(w: number, h: number, tf: string, cls: string, r: number) {
    const f = document.createElement('div');
    f.className = 'f ' + cls;
    f.style.cssText = `width:${w}px;height:${h}px;left:${-w / 2}px;top:${-h / 2}px;transform:${tf};border-radius:${r}px`;
    return f;
  }
  function cuboid(w: number, h: number, d: number, cls: string, ghost: boolean, r: number) {
    const c = document.createElement('div');
    c.className = 'cub ' + cls;
    const faces: [string, number, number, string][] = [
      ['ff', w, h, `translateZ(${d / 2}px)`],
      ['fr', d, h, `rotateY(90deg) translateZ(${w / 2}px)`],
      ['ft', w, d, `rotateX(90deg) translateZ(${h / 2}px)`],
    ];
    if (!ghost) faces.push(
      ['fb', w, h, `rotateY(180deg) translateZ(${d / 2}px)`],
      ['fl', d, h, `rotateY(-90deg) translateZ(${w / 2}px)`],
      ['fu', w, d, `rotateX(-90deg) translateZ(${h / 2}px)`],
    );
    for (const [k, fw, fh, tf] of faces) c.appendChild(face(fw, fh, tf, k, r));
    return c;
  }

  const b: Builder = {
    root,
    targets,
    box(o) {
      const p = document.createElement('div');
      p.className = 'piece m-' + o.mat;
      p.style.transform = `translate3d(${o.x}px,${-o.y}px,${o.z}px)` + (o.rot ? ' ' + o.rot : '');
      p.style.setProperty('--td', stagger());
      const r = o.radius ?? (o.mat === 'ink' ? 1 : Math.max(4, Math.min(10, Math.round(Math.min(o.w, o.h, o.d) / 2))));
      const drop = document.createElement('div');
      drop.className = 'drop';
      if (o.ghost !== false) p.appendChild(cuboid(o.w, o.h, o.d, 'g', true, 0));
      drop.appendChild(cuboid(o.w, o.h, o.d, 'sd', false, r));
      p.appendChild(drop);
      (o.parent || root).appendChild(p);
      pieces.push({ el: p, at: o.at, off: o.off });
      if (o.track !== false && !o.parent && o.off === undefined) targets.push({ x: o.x, y: o.y + o.h / 2, z: o.z, at: o.at });
      return p;
    },
    bill(o) {
      const el = document.createElement('div');
      el.className = 'bill';
      el.style.setProperty('--td', stagger());
      if (o.size) el.style.fontSize = o.size + 'px';
      el.innerHTML = (o.emoji ? `<span class="e">${o.emoji}</span>` : '') + (o.label ? `<small>${o.label}</small>` : '');
      el.style.transform = `translate3d(${o.x}px,${-o.y}px,${o.z}px) rotateY(calc(var(--scene-ry) * -1deg)) rotateX(calc(var(--scene-rx) * -1deg))`;
      root.appendChild(el);
      pieces.push({ el, at: o.at, off: o.off });
      return el;
    },
    plate(o) {
      const el = document.createElement('div');
      el.className = 'plate ' + (o.cls || '');
      el.style.cssText = `width:${o.w}px;height:${o.h}px;left:${-o.w / 2}px;top:${-o.h / 2}px;transform:translate3d(${o.x}px,${-o.y}px,${o.z}px) rotateY(${o.ry || 0}deg)`;
      el.innerHTML = o.html;
      el.querySelectorAll('span').forEach((s, i) => (s.style.transitionDelay = i * 90 + 'ms'));
      root.appendChild(el);
      pieces.push({ el, at: o.at });
      return el;
    },
    svgPlate(o) {
      const el = document.createElement('div');
      el.className = 'svgplate ' + (o.cls || '');
      el.style.cssText = `width:${o.w}px;height:${o.h}px;left:${-o.w / 2}px;top:${-o.h / 2}px;transform:translate3d(${o.x}px,${-o.y}px,${o.z}px) rotateY(${o.ry || 0}deg) rotateX(${o.rx || 0}deg) rotateZ(${o.rz || 0}deg)`;
      el.style.setProperty('--td', stagger());
      el.innerHTML = o.svg;
      (o.parent || root).appendChild(el);
      pieces.push({ el, at: o.at, off: o.off });
      return el;
    },
    plane(o) {
      const el = document.createElement('div');
      el.className = 'plane ' + o.cls;
      el.style.cssText = `width:${o.w}px;height:${o.d}px;left:${-o.w / 2}px;top:${-o.d / 2}px;transform:translate3d(${o.x}px,${-(o.y ?? 0)}px,${o.z}px) rotateX(90deg)`;
      root.appendChild(el);
      if (o.at !== undefined) pieces.push({ el, at: o.at });
      return el;
    },
    group(transform, parent, cls) {
      const g = document.createElement('div');
      g.className = cls || 'grp';
      g.style.transform = transform;
      (parent || root).appendChild(g);
      return g;
    },
    register(el, at, off) {
      pieces.push({ el, at, off });
    },
  };
  return b;
}

/** Live mounted scenes — read by tools/leak.mjs; must return to 0 or 1. */
export const __sceneDebug = { mounted: 0 };

/* ── mount ──────────────────────────────────────────────────── */
export function mountScene(stage: HTMLElement, def: SceneDef, opts: MountOptions): SceneHandle {
  stage.replaceChildren();
  __sceneDebug.mounted++;
  stage.dataset['treatment'] = opts.treatment;
  stage.dataset['assembly'] = opts.assembly;
  stage.classList.remove('settled');

  const viewport = document.createElement('div');
  viewport.className = 'scene__viewport';
  const camera = document.createElement('div');
  camera.className = 'scene__camera';
  const world = document.createElement('div');
  world.className = 'scene__world';
  const build = document.createElement('div');
  build.className = 'scene__build';
  world.appendChild(build);
  camera.appendChild(world);
  viewport.appendChild(camera);
  stage.appendChild(viewport);

  stage.style.setProperty('--scene-ry', String(opts.camera.yaw));
  stage.style.setProperty('--scene-rx', String(opts.camera.pitch));

  const pieces: Piece[] = [];
  const targets: Target[] = [];
  let builder = makeBuilder(build, pieces, targets);
  let adjustments = { ...opts.adjustments };
  let tick: BuildResult['tick'];
  const result = def.build(builder, adjustments);
  tick = result?.tick;
  targets.sort((a, b) => a.at - b.at);

  /* fit the model to the stage: scale from the scene's declared extent,
     lift so the pivot sits where the model is centred */
  const fit = () => {
    const w = stage.clientWidth || 1;
    const h = stage.clientHeight || 1;
    const s = Math.min(w / def.fit.width, h / def.fit.height) * opts.camera.scale;
    stage.style.setProperty('--scene-s', s.toFixed(4));
    stage.style.setProperty('--scene-lift', `${(def.fit.height * s * (def.fit.lift ?? 0.5)).toFixed(1)}px`);
  };
  fit();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
  ro?.observe(stage);

  /* timeline */
  let raf = 0;
  let assembled = false;
  let alive = true;
  const apply = (p: number) => {
    for (const pc of pieces) {
      const on = p >= pc.at && (pc.off === undefined || p < pc.off);
      pc.el.classList.toggle('built', on);
      if (pc.off !== undefined) pc.el.classList.toggle('gone', p >= pc.off);
    }
    tick?.(p, opts.reduced);
  };
  const settle = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    stage.classList.add('settled');
    apply(1);
    assembled = true;
  };
  const assemble = () =>
    new Promise<void>((resolve) => {
      if (!alive) return resolve();
      cancelAnimationFrame(raf);
      if (opts.reduced || opts.assembly === 'none' || opts.assembleMs <= 0) {
        settle();
        return resolve();
      }
      stage.classList.remove('settled');
      assembled = false;
      const t0 = performance.now();
      const frame = (now: number) => {
        if (!alive) return resolve();
        const p = Math.min(1, (now - t0) / opts.assembleMs);
        apply(p);
        if (p < 1) raf = requestAnimationFrame(frame);
        else {
          raf = 0;
          assembled = true;
          stage.classList.add('settled');
          resolve();
        }
      };
      apply(0);
      raf = requestAnimationFrame(frame);
    });

  const handle: SceneHandle = {
    id: def.id,
    get assembled() { return assembled; },
    assemble,
    settle,
    async rebuild() {
      if (!alive) return;
      stage.classList.remove('settled');
      apply(0);
      // let the "unbuilt" state paint before the timeline starts again
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      await assemble();
    },
    update(next) {
      if (!alive) return;
      adjustments = { ...next };
      const ok = def.update?.(builder, adjustments);
      if (!ok) {
        // full regenerate, preserving the assembled state
        cancelAnimationFrame(raf);
        raf = 0;
        pieces.length = 0;
        targets.length = 0;
        build.replaceChildren();
        builder = makeBuilder(build, pieces, targets);
        tick = def.build(builder, adjustments)?.tick;
        targets.sort((a, b) => a.at - b.at);
        fit();
        if (assembled || opts.reduced) settle();
        else void assemble();
      }
    },
    teardown() {
      if (!alive) return;
      alive = false;
      __sceneDebug.mounted--;
      cancelAnimationFrame(raf);
      raf = 0;
      ro?.disconnect();
      stage.replaceChildren();
      delete stage.dataset['treatment'];
      delete stage.dataset['assembly'];
      stage.classList.remove('settled');
      pieces.length = 0;
      targets.length = 0;
    },
  };
  return handle;
}

