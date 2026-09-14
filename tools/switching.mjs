/* Exercises the apply pipeline against the production build:
 *   rapid   — three applies fired without awaiting; only the last commits,
 *             the others report "superseded", nothing stale is persisted
 *   cycle   — 10 full cycles through every built direction; DOM node count,
 *             mounted scenes, stylesheet links and owned tokens stay bounded
 *   anchor  — scrolled to Process, switching keeps the heading within 24px
 *   reduce  — Reduce effects during an assembly settles the scene at once
 *   fonts   — with font files blocked, a switch still applies, marked fallback
 *   tune    — a level control with decor+scene paths updates both; reset restores
 *   node tools/switching.mjs */
import { serve } from './lib/serve.mjs';
import { launch, newPage, settle } from './lib/browser.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const server = await serve(`${ROOT}dist`);
const browser = await launch();
let failures = 0;
const report = (ok, name, detail) => { if (!ok) failures++; console.log(`${ok ? ' ok ' : 'FAIL'} ${name}${detail ? ': ' + detail : ''}`); };

async function open({ blockFonts = false } = {}) {
  const page = await newPage(browser, { width: 1280, height: 900 });
  if (blockFonts) await page.route(/\.woff2$/, (r) => r.abort('failed'));
  await page.goto(`${server.url}/`, { waitUntil: 'load' });
  await settle(page, 200);
  return page;
}

try {
  /* rapid */
  {
    const page = await open();
    const r = await page.evaluate(async () => {
      const ids = window.rd.builtIds.filter((i) => i !== window.rd.applied);
      const seq = [ids[0], ids[1], ids[0], ids[1]];
      const outcomes = await Promise.all(seq.map((id) => window.rd.apply(id, 'test')));
      await new Promise((r) => setTimeout(r, 300));
      const links = [...document.querySelectorAll('link[data-direction]')].map((l) => `${/** @type {HTMLLinkElement} */ (l).dataset.direction}:${/** @type {HTMLLinkElement} */ (l).media || 'all'}`);
      return { seq, outcomes, applied: window.rd.applied, pending: window.rd.pending, html: document.documentElement.dataset.direction, stored: JSON.parse(localStorage.getItem('rd.artdirection') || '{}').direction, links };
    });
    const last = r.seq[r.seq.length - 1];
    const ok = r.applied === last && r.html === last && r.stored === last && r.pending === null && r.outcomes.filter((o) => o === 'applied').length === 1 && r.outcomes[3] === 'applied' && r.links.filter((l) => l.endsWith(':all')).length === 1;
    report(ok, 'rapid switching: only the last request commits', JSON.stringify(r));
    await page.context().close();
  }
  /* cycle */
  {
    const page = await open();
    const r = await page.evaluate(async () => {
      const ids = window.rd.builtIds;
      const snap = () => ({ nodes: document.getElementsByTagName('*').length, ...window.rd.debug, canvas: getComputedStyle(document.documentElement).getPropertyValue('--color-canvas') });
      const samples = [];
      for (let cycle = 0; cycle < 10; cycle++) {
        for (const id of ids) { await window.rd.apply(id, 'test'); }
        samples.push(snap());
      }
      return samples;
    });
    const first = r[0], lastS = r[r.length - 1];
    const ok = first.nodes === lastS.nodes && lastS.mountedScenes <= 1 && lastS.links <= 3 && r.every((s) => s.mountedScenes <= 1);
    report(ok, 'cycling 10× through all directions keeps DOM, scenes and links bounded', `nodes ${first.nodes}→${lastS.nodes}, scenes ${lastS.mountedScenes}, links ${lastS.links}, ownedVars ${lastS.ownedVars}, ownedData ${lastS.ownedData}`);
    await page.context().close();
  }
  /* anchor */
  {
    const page = await open();
    const r = await page.evaluate(async () => {
      const h = document.getElementById('process-title');
      h.scrollIntoView({ block: 'start', behavior: 'instant' });
      window.scrollBy({ top: -80, behavior: 'instant' });
      const before = h.getBoundingClientRect().top;
      const out = [];
      for (const id of window.rd.builtIds.filter((i) => i !== window.rd.applied)) {
        await window.rd.apply(id, 'test');
        out.push({ id, delta: Math.round(h.getBoundingClientRect().top - before) });
      }
      return out;
    });
    report(r.every((o) => Math.abs(o.delta) <= 24), 'scroll anchor keeps the viewed heading within 24px across switches', JSON.stringify(r));
    await page.context().close();
  }
  /* reduce effects */
  {
    const page = await open();
    const r = await page.evaluate(async () => {
      const id = window.rd.builtIds.find((i) => i !== window.rd.applied);
      const p = window.rd.apply(id, 'test');
      await new Promise((r) => setTimeout(r, 250)); // mid-assembly
      window.rd.setGlobal({ reduceEffects: true });
      const settledNow = document.querySelector('.scene__stage').classList.contains('settled');
      const attr = document.documentElement.dataset.reduceEffects;
      await p;
      const stored = JSON.parse(localStorage.getItem('rd.artdirection') || '{}').global?.reduceEffects;
      return { settledNow, attr, stored, dur: getComputedStyle(document.documentElement).getPropertyValue('--motion-reveal-duration') };
    });
    report(r.settledNow && r.attr === 'true' && r.stored === true, 'Reduce effects settles a running assembly immediately and persists', JSON.stringify(r));
    await page.context().close();
  }
  /* fonts blocked */
  {
    const page = await open({ blockFonts: true });
    const r = await page.evaluate(async () => {
      const id = window.rd.builtIds.find((i) => i !== window.rd.applied);
      const t0 = performance.now();
      const out = await window.rd.apply(id, 'test');
      return { out, ms: Math.round(performance.now() - t0), fonts: document.documentElement.dataset.fonts, applied: window.rd.applied };
    });
    report(r.out === 'applied' && r.fonts === 'fallback' && r.ms < 4000, 'blocked fonts: switch applies on fallbacks within the timeout', JSON.stringify(r));
    await page.context().close();
  }
  /* tune paths */
  {
    const page = await open();
    const r = await page.evaluate(async () => {
      await window.rd.apply('art-nouveau', 'test');
      const detailOf = () => /** @type {HTMLElement | null} */ (document.querySelector('.metro'))?.dataset.detail;
      const before = { slots: document.querySelectorAll('[data-slot="hero-ornament"] svg').length, detail: detailOf() };
      window.rd.applyTune('lineDetail', 'off');
      const off = { slots: document.querySelectorAll('[data-slot="hero-ornament"] svg').length, detail: detailOf(), attr: document.documentElement.dataset.lineDetail, stored: JSON.parse(localStorage.getItem('rd.artdirection') || '{}').tune['art-nouveau'].lineDetail };
      window.rd.resetDirection();
      const reset = { slots: document.querySelectorAll('[data-slot="hero-ornament"] svg').length, detail: detailOf(), attr: document.documentElement.dataset.lineDetail, stored: JSON.parse(localStorage.getItem('rd.artdirection') || '{}').tune['art-nouveau'] };
      return { before, off, reset };
    });
    const ok = r.before.slots === 3 && r.off.slots === 0 && r.off.detail === 'off' && r.off.attr === 'off' && r.off.stored === 'off' && r.reset.slots === 3 && r.reset.detail === 'full' && r.reset.stored === undefined;
    report(ok, 'Tune: lineDetail drives decor + scene + css together; reset restores the recipe', JSON.stringify(r));
    await page.context().close();
  }
} finally {
  await browser.close();
  await server.close();
}
console.log(failures ? `\nswitching: ${failures} failure(s)` : '\nswitching: all cases passed');
process.exit(failures ? 1 : 0);
