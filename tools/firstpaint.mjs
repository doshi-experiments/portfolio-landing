/* Tests the first-paint strategy for a persisted non-default direction
 * against the production build, rather than assuming it:
 *
 *   1. hold               — the direction stylesheet is delayed 800 ms; the
 *      body must stay hidden until it lands, and no visible frame may show
 *      the default's canvas colour.
 *   2. cap                — delayed 2.5 s; the hold must release at 1.5 s with
 *      the direction's colours (inline tokens) and the page must finish in
 *      the right direction once the sheet arrives.
 *   3. stylesheet error   — the request is aborted; the page must fall back
 *      to the default, mark data-boot="fallback", and re-persist the default.
 *
 * Every frame after navigation is sampled from an init script; the report
 * lists the canvas colour per sample together with the paint timings.
 *   node tools/firstpaint.mjs [--direction art-nouveau] */
import { serve } from './lib/serve.mjs';
import { launch, newPage } from './lib/browser.mjs';

const args = process.argv.slice(2);
const dir = args.includes('--direction') ? args[args.indexOf('--direction') + 1] : 'art-nouveau';
const ROOT = new URL('..', import.meta.url).pathname;
const server = await serve(`${ROOT}dist`);
const browser = await launch();
let failures = 0;

const SAMPLER = () => {
  const samples = [];
  const paints = {};
  const tick = () => {
    const h = document.documentElement;
    samples.push({ t: performance.now(), canvas: getComputedStyle(h).getPropertyValue('--color-canvas').trim(), dir: h.getAttribute('data-direction'), pending: h.hasAttribute('data-css-pending'), vis: document.body ? getComputedStyle(document.body).visibility : 'nobody' });
    if (samples.length < 400) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) paints[e.name] = e.startTime; }).observe({ type: 'paint', buffered: true });
  } catch {}
  window.__fp = { samples, paints };
};

async function run(name, { delayCss = 0, failCss = false, capped = false }) {
  const page = await newPage(browser, { width: 1200, height: 900, direction: dir });
  await page.addInitScript(SAMPLER);
  // only the direction's own sheet is delayed or failed; the critical
  // stylesheet is parser-inserted and must load normally
  const own = new RegExp(`/${dir}\\.[A-Za-z0-9_-]+\\.css$`);
  await page.route(/\/_astro\/.*\.css$/, async (route) => {
    const url = route.request().url();
    if (!own.test(url)) return route.continue();
    if (failCss) return route.abort('failed');
    if (delayCss) await new Promise((r) => setTimeout(r, delayCss));
    return route.continue();
  });
  await page.goto(`${server.url}/`, { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  const r = await page.evaluate(() => ({ ...window.__fp, final: { dir: document.documentElement.dataset.direction, boot: document.documentElement.dataset.boot ?? null, stored: (() => { try { return localStorage.getItem('rd.artdirection'); } catch { return null; } })() } }));
  const fcp = r.paints['first-contentful-paint'] ?? r.paints['first-paint'] ?? 0;
  const canvasOf = (d) => page.evaluate((d) => { for (const st of document.querySelectorAll('style')) { const m = st.textContent.match(new RegExp(`:root\\[data-direction="${d}"\\]\\{[^}]*--color-canvas:(#[0-9A-Fa-f]{6})`)); if (m) return m[1]; } return null; }, d);
  const expected = await canvasOf(dir);
  const swissCanvas = await canvasOf('swiss');
  const visibleFrames = r.samples.filter((s) => s.t >= fcp && s.vis === 'visible');
  const wrong = visibleFrames.filter((s) => s.canvas.toUpperCase() === (swissCanvas ?? '').toUpperCase());
  const firstVisible = visibleFrames[0];
  const stored = r.final.stored ? JSON.parse(r.final.stored) : null;
  let ok;
  if (failCss) ok = r.final.dir === 'swiss' && r.final.boot === 'fallback' && (!stored || stored.direction === 'swiss');
  else if (capped) ok = !!firstVisible && firstVisible.t > 1400 && firstVisible.t < 2000 && firstVisible.canvas.toUpperCase() === (expected ?? '').toUpperCase() && r.final.dir === dir;
  else ok = wrong.length === 0 && r.final.dir === dir && !!firstVisible && firstVisible.t >= delayCss && firstVisible.canvas.toUpperCase() === (expected ?? '').toUpperCase();
  if (!ok) failures++;
  console.log(`${ok ? ' ok ' : 'FAIL'} ${name}: fcp=${fcp.toFixed(0)}ms samples=${r.samples.length} visibleAfterFcp=${visibleFrames.length} defaultCanvasFrames=${wrong.length} firstVisible=${firstVisible ? `${firstVisible.t.toFixed(0)}ms ${firstVisible.canvas} pending=${firstVisible.pending}` : '—'} final=${r.final.dir}/${r.final.boot ?? '-'}`);
  await page.context().close();
}

try {
  await run('hold: css delayed 800ms → hidden until it lands, no default frame', { delayCss: 800 });
  await run('cap: css delayed 2500ms → visible at 1500ms in the right colours', { delayCss: 2500, capped: true });
  await run('stylesheet error → default + fallback mark', { failCss: true });
} finally {
  await browser.close();
  await server.close();
}
console.log(failures ? `\nfirstpaint: ${failures} failure(s)` : '\nfirstpaint: all cases passed');
process.exit(failures ? 1 : 0);
