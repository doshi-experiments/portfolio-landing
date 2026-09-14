/* The theme engine: applies a direction atomically.
 *
 *   apply(id) → prepare (CSS · fonts · scene · decorations, in parallel,
 *   each with its own outcome) → commit (synchronous, inside a view
 *   transition when allowed).
 *
 * Only the newest request may commit: every apply takes a token, the commit
 * callback re-checks it first, and stale work touches nothing — not the DOM,
 * not state, not storage. CSS is the one hard requirement; fonts, the scene
 * and decorations degrade. The current theme stays whole until the next
 * one is ready. Everything the engine stamps on <html> is recorded so it
 * can be cleared as a set before the next set goes on. */

import { DIRECTION_DATA, directionData, isBuilt } from '@content/directions';
import { resolve, validateAdjustments, type Resolved } from '@design/resolve';
import type { Adjustments, ControlSpec, DirectionData, DirectionId, GlobalPrefs } from '@design/schema';
import { captionFor } from '@design/caption';
import { DEFAULT_DIRECTION } from '@design/schema';
import { loadDirectionClient, type DirectionClient } from './directions';
import { loadFonts, type FontOutcome } from './fonts';
import { BUILD_ID, DIRECTION_CSS } from './manifest';
import { clear as clearStorage, fresh, load, save, type Persisted } from './persistence';
import { captureAnchor, restoreAnchor } from './scroll-anchor';
import { loadScene } from './scene';
import { __sceneDebug, mountScene, type SceneDef, type SceneHandle } from './scene/engine';

export type ApplyOutcome = 'applied' | 'noop' | 'superseded' | 'failed';

export interface AppliedDetail {
  id: DirectionId;
  resolved: Resolved;
  fonts: FontOutcome | null;
  reason: string;
}

const CSS_TIMEOUT = 4000;
const html = document.documentElement;

export class Engine {
  private seq = 0;
  private persisted: Persisted;
  private links = new Map<DirectionId, HTMLLinkElement>();
  private scene: SceneHandle | null = null;
  private decor: DirectionClient | null = null;
  private ownedVars: string[] = [];
  private ownedData: string[] = [];
  private transition: ViewTransition | null = null;
  private readonly stage: HTMLElement | null;
  private readonly live: HTMLElement | null;
  applied: DirectionId;
  pending: DirectionId | null = null;
  fonts: FontOutcome | null = null;
  lastResolved: Resolved | null = null;

  constructor() {
    this.stage = document.querySelector<HTMLElement>('.scene__stage');
    this.live = document.getElementById('live');
    const stored = load();
    this.persisted = stored && isBuilt(stored.direction) ? stored : fresh(DEFAULT_DIRECTION);
    // boot already stamped the document; trust its choice when it is built,
    // otherwise (unknown id, boot fell back) start from the default
    const booted = html.dataset['direction'];
    this.applied = booted && isBuilt(booted) ? booted : DEFAULT_DIRECTION;
    if (this.persisted.direction !== this.applied) this.persisted.direction = this.applied;
    // adopt the stylesheet boot inserted, so it is never fetched twice
    for (const link of document.querySelectorAll<HTMLLinkElement>('link[data-direction]')) {
      const id = link.dataset['direction'];
      if (id && isBuilt(id)) this.links.set(id, link);
    }
  }

  /* ── public state ─────────────────────────────────────────── */
  get global(): GlobalPrefs { return this.persisted.global; }
  adjustmentsFor(id: DirectionId): Adjustments {
    return validateAdjustments(directionData(id).controls, this.persisted.tune[id]);
  }
  get reduced(): boolean {
    return this.persisted.global.reduceEffects || matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** First run after the modules load: the document is already styled by
   *  boot; this mounts the scene, decorations and UI without a transition. */
  async hydrate(): Promise<void> {
    const id = this.applied;
    const d = directionData(id);
    const token = ++this.seq;
    const [sceneDef, decor] = await Promise.all([loadScene(d.recipe.scene.id), loadDirectionClient(id)]);
    if (token !== this.seq) return;
    this.fonts = await loadFonts(d, 1500);
    if (token !== this.seq) return;
    this.commitNow(token, d, this.adjustmentsFor(id), { sceneDef, decor, fonts: this.fonts }, 'hydrate', false);
  }

  /* ── apply ────────────────────────────────────────────────── */
  async apply(id: DirectionId, reason = 'select'): Promise<ApplyOutcome> {
    if (!isBuilt(id)) return 'failed';
    if (id === this.applied && this.pending === null) return 'noop';
    const token = ++this.seq;
    this.pending = id;
    this.emit('rd:pending', { id });

    const d = directionData(id);
    const [css, fonts, sceneDef, decor] = await Promise.all([
      this.ensureCss(id),
      loadFonts(d),
      loadScene(d.recipe.scene.id),
      loadDirectionClient(id),
    ]);
    if (token !== this.seq) return 'superseded';
    if (!css) {
      this.pending = null;
      this.emit('rd:failed', { id });
      this.announce(`Couldn’t load ${d.name}; staying on ${directionData(this.applied).name}.`, true);
      return 'failed';
    }
    return this.commit(token, d, this.adjustmentsFor(id), { sceneDef, decor, fonts }, reason);
  }

  private ensureCss(id: DirectionId): Promise<boolean> {
    if (id === DEFAULT_DIRECTION) return Promise.resolve(true); // in the critical bundle
    const existing = this.links.get(id);
    if (existing?.dataset['state'] === 'loaded') return Promise.resolve(true);
    const url = DIRECTION_CSS[id];
    if (!url) return Promise.resolve(false);
    return new Promise((res) => {
      const link = existing ?? document.createElement('link');
      let done = false;
      const finish = (ok: boolean) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        link.dataset['state'] = ok ? 'loaded' : 'failed';
        if (!ok) { link.remove(); this.links.delete(id); }
        res(ok);
      };
      const timer = setTimeout(() => finish(false), CSS_TIMEOUT);
      if (!existing) {
        link.rel = 'stylesheet';
        link.href = url;
        link.media = 'not all'; // fetch now, apply at commit
        link.dataset['direction'] = id;
        link.dataset['state'] = 'loading';
        link.addEventListener('load', () => finish(true), { once: true });
        link.addEventListener('error', () => finish(false), { once: true });
        document.head.appendChild(link);
        this.links.set(id, link);
      } else {
        link.addEventListener('load', () => finish(true), { once: true });
        link.addEventListener('error', () => finish(false), { once: true });
      }
    });
  }

  // deliberately not async: the view-transition callback must run synchronously
  private commit(
    token: number, d: DirectionData, adj: Adjustments,
    assets: { sceneDef: SceneDef | null; decor: DirectionClient | null; fonts: FontOutcome },
    reason: string,
  ): Promise<ApplyOutcome> {
    const start = typeof document.startViewTransition === 'function' && !this.reduced
      ? document.startViewTransition.bind(document) : null;
    if (!start) return Promise.resolve(this.commitNow(token, d, adj, assets, reason, true) ? 'applied' : 'superseded');
    let outcome: ApplyOutcome = 'superseded';
    const vt: ViewTransition = start(() => {
      // the latest-request check lives *inside* the update callback: a newer
      // apply may have started while the browser took its snapshot
      const ok = this.commitNow(token, d, adj, assets, reason, true);
      outcome = ok ? 'applied' : 'superseded';
      if (!ok) vt.skipTransition();
    });
    this.transition = vt;
    return vt.finished.catch(() => undefined).then(() => {
      if (this.transition === vt) this.transition = null;
      return outcome;
    });
  }

  /** The synchronous heart. Returns false when the token is stale. */
  private commitNow(
    token: number, d: DirectionData, adj: Adjustments,
    assets: { sceneDef: SceneDef | null; decor: DirectionClient | null; fonts: FontOutcome | null },
    reason: string, anchor: boolean,
  ): boolean {
    if (token !== this.seq) return false;
    const a = anchor ? captureAnchor() : null;

    this.decor?.undecorate(document);
    this.scene?.teardown();
    this.scene = null;

    const res = resolve(d, adj, this.persisted.global);
    this.stamp(res);
    for (const [id, link] of this.links) link.media = id === d.id ? '' : 'not all';
    if (assets.fonts) html.dataset['fonts'] = assets.fonts;

    this.decor = assets.decor;
    this.decor?.decorate(document, res.adjustments);
    this.mountScene(d, res.adjustments, assets.sceneDef);

    this.applied = d.id;
    this.pending = null;
    this.fonts = assets.fonts;
    this.lastResolved = res;
    this.persisted.direction = d.id;
    this.persisted.cache = { buildId: BUILD_ID, direction: d.id, vars: res.vars, data: res.data };
    save(this.persisted);

    this.updateUi(d, res);
    restoreAnchor(a);
    this.emit('rd:applied', { id: d.id, resolved: res, fonts: assets.fonts, reason } satisfies AppliedDetail);
    if (reason !== 'hydrate') this.announce(`Applied: ${d.name}.`);
    return true;
  }

  /* ── stamping: clear the previous set, then write the next ── */
  private stamp(res: Resolved): void {
    for (const v of this.ownedVars) html.style.removeProperty(v);
    for (const k of this.ownedData) delete html.dataset[k];
    for (const [k, v] of Object.entries(res.vars)) html.style.setProperty(k, v);
    for (const [k, v] of Object.entries(res.data)) html.setAttribute(`data-${k}`, v);
    this.ownedVars = Object.keys(res.vars);
    this.ownedData = Object.keys(res.data).map((k) => k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()));
  }

  private mountScene(d: DirectionData, adj: Adjustments, def: SceneDef | null): void {
    if (!this.stage) return;
    this.updateCaption(d);
    if (!def || html.dataset['scene'] === 'off') return;
    const s = d.recipe.scene;
    this.scene = mountScene(this.stage, def, {
      camera: s.camera, treatment: s.treatment, assembly: s.assembly, assembleMs: s.assembleMs,
      reduced: this.reduced, adjustments: adj,
    });
    void this.scene.assemble();
  }

  private updateCaption(d: DirectionData): void {
    const ref = document.querySelector('.scene__ref');
    if (ref) ref.textContent = captionFor(d.recipe.scene.reference);
  }

  private updateUi(d: DirectionData, _res: Resolved): void {
    for (const el of document.querySelectorAll<HTMLElement>('[data-education]')) el.hidden = el.dataset['education'] !== d.id;
    for (const el of document.querySelectorAll<HTMLElement>('[data-identity]')) el.textContent = `${d.name} · ${d.period}`;
  }

  /* ── tune / global ────────────────────────────────────────── */
  applyTune(controlId: string, value: string | number): void {
    const d = directionData(this.applied);
    const spec = d.controls.find((c) => c.id === controlId);
    if (!spec) return;
    const next = validateAdjustments(d.controls, { ...this.adjustmentsFor(this.applied), [controlId]: value });
    this.persisted.tune[this.applied] = next;
    this.runPaths(d, next, spec.affects);
    save(this.persisted);
    this.emit('rd:tuned', { id: this.applied, controlId, value: next[controlId] });
  }

  private runPaths(d: DirectionData, adj: Adjustments, affects: ControlSpec['affects']): Resolved {
    const res = resolve(d, adj, this.persisted.global);
    this.lastResolved = res;
    if (affects.includes('css')) {
      this.stamp(res);
      this.persisted.cache = { buildId: BUILD_ID, direction: d.id, vars: res.vars, data: res.data };
    }
    if (affects.includes('decor') && this.decor) {
      this.decor.undecorate(document);
      this.decor.decorate(document, res.adjustments);
    }
    if (affects.includes('scene')) this.scene?.update(res.adjustments);
    if (affects.includes('ui')) this.updateUi(d, res);
    return res;
  }

  setGlobal(patch: Partial<GlobalPrefs>): void {
    const before = this.persisted.global;
    this.persisted.global = { ...before, ...patch };
    const d = directionData(this.applied);
    const adj = this.adjustmentsFor(this.applied);
    if (patch.reduceEffects === true && !before.reduceEffects) {
      // stop everything now: in-flight transition, running assembly, reveals
      this.transition?.skipTransition();
      this.scene?.settle();
    }
    this.runPaths(d, adj, ['css', 'decor', 'scene', 'ui']);
    save(this.persisted);
    this.emit('rd:global', { global: this.persisted.global });
  }

  resetDirection(id: DirectionId = this.applied): void {
    delete this.persisted.tune[id];
    delete this.persisted.remix[id];
    if (id === this.applied) this.runPaths(directionData(id), this.adjustmentsFor(id), ['css', 'decor', 'scene', 'ui']);
    save(this.persisted);
    this.emit('rd:reset', { id });
  }

  async resetAll(): Promise<void> {
    clearStorage();
    this.persisted = fresh(DEFAULT_DIRECTION);
    this.emit('rd:reset', { id: null });
    if (this.applied !== DEFAULT_DIRECTION) await this.apply(DEFAULT_DIRECTION, 'reset');
    else this.runPaths(directionData(this.applied), {}, ['css', 'decor', 'scene', 'ui']);
  }

  /* ── scene controls ───────────────────────────────────────── */
  rebuildScene(): void { void this.scene?.rebuild(); }

  setSceneVisible(visible: boolean): void {
    if (visible) delete html.dataset['scene'];
    else html.dataset['scene'] = 'off';
    const d = directionData(this.applied);
    if (!visible) { this.scene?.teardown(); this.scene = null; return; }
    if (!this.scene) void loadScene(d.recipe.scene.id).then((def) => { if (!this.scene && html.dataset['scene'] !== 'off') this.mountScene(d, this.adjustmentsFor(this.applied), def); });
  }

  /* ── plumbing ─────────────────────────────────────────────── */
  private emit(type: string, detail: unknown): void {
    document.dispatchEvent(new CustomEvent(type, { detail }));
  }
  private announce(text: string, alsoNotice = false): void {
    if (this.live) { this.live.textContent = ''; requestAnimationFrame(() => { if (this.live) this.live.textContent = text; }); }
    if (alsoNotice) {
      const n = document.getElementById('notice');
      if (n) { n.textContent = text; n.hidden = false; setTimeout(() => (n.hidden = true), 6000); }
    }
  }

  get builtIds(): DirectionId[] { return Object.keys(DIRECTION_DATA) as DirectionId[]; }

  /** For tools/switching.mjs: what must stay bounded across switches. */
  get debug() {
    return { mountedScenes: __sceneDebug.mounted, links: this.links.size, ownedVars: this.ownedVars.length, ownedData: this.ownedData.length, seq: this.seq };
  }
}

declare global {
  interface Window { rd?: Engine }
}
