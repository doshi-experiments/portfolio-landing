/* The visual comparison sheet: the same content in every built direction,
 * at each width, with the scene visible and hidden. Screenshots come from
 * the production build in dist/ (build with DEV_FIXTURES=1 to include the
 * long-form fixture page). Output: tools/out/sheet.html
 *
 *   node tools/sheet.mjs [--gate] [--directions a,b,c] [--widths 390,1440]
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { serve } from './lib/serve.mjs';
import { launch, newPage, settle } from './lib/browser.mjs';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const GATE = ['swiss', 'art-nouveau', 'brutalism'];
const directions = args.includes('--gate') ? GATE : (opt('--directions', GATE.join(',')).split(','));
const widths = opt('--widths', args.includes('--gate') ? '390,1440' : '390,820,1440').split(',').map(Number);
const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'tools/out');
const SHOTS = join(OUT, 'shots');
await mkdir(SHOTS, { recursive: true });

const exists = (p) => access(p).then(() => true, () => false);
const pages = [{ id: 'home', path: '/' }];
if (await exists(join(ROOT, 'dist/dev/long-form/index.html'))) pages.push({ id: 'long-form', path: '/dev/long-form/' });

const server = await serve(join(ROOT, 'dist'));
const browser = await launch();
const cells = [];
try {
  for (const direction of directions) {
    for (const width of widths) {
      for (const scene of [true, false]) {
        for (const pg of pages) {
          if (pg.id !== 'home' && !scene) continue; // the fixture has no scene
          const page = await newPage(browser, { width, height: Math.round(width * 0.66), direction, scene });
          const url = `${server.url}${pg.path}${scene ? '' : '?scene=0'}`;
          await page.goto(url, { waitUntil: 'load' });
          await settle(page);
          if (scene) await page.waitForSelector('.scene__stage.settled', { timeout: 6000 }).catch(() => {});
          const applied = await page.evaluate(() => document.documentElement.dataset.direction);
          const fonts = await page.evaluate(() => document.documentElement.dataset.fonts);
          const file = `${direction}-${width}-${scene ? 'scene' : 'noscene'}-${pg.id}.png`;
          await page.screenshot({ path: join(SHOTS, file), fullPage: true });
          cells.push({ direction, width, scene, page: pg.id, file, applied, fonts });
          console.log(`  ${file}  (applied=${applied} fonts=${fonts})`);
          await page.context().close();
        }
      }
    }
  }
} finally {
  await browser.close();
  await server.close();
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const groups = new Map();
for (const c of cells) {
  const key = `${c.page} · ${c.width}px · ${c.scene ? 'scene visible' : 'scene hidden'}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(c);
}
const html = `<!doctype html><meta charset="utf-8"><title>Comparison sheet</title>
<style>
  body{margin:0;padding:24px;font:14px/1.4 system-ui,sans-serif;background:#e9e9e6;color:#222}
  h1{font-size:18px;margin:0 0 16px}h2{font-size:15px;margin:32px 0 8px}
  .row{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(280px,1fr);gap:16px;overflow-x:auto;align-items:start}
  figure{margin:0;background:#fff;padding:8px;border:1px solid #ccc}
  figcaption{font-size:12px;margin-bottom:6px;display:flex;justify-content:space-between;gap:8px}
  img{width:100%;height:auto;display:block;border:1px solid #ddd}
  .warn{color:#b00}
</style>
<h1>Comparison sheet — ${esc(directions.join(', '))} · widths ${esc(widths.join('/'))} · ${new Date().toISOString().slice(0, 16)}</h1>
<p>Same content, same reading order. Rows compare directions at one width; "scene hidden" rows are the test that the interface itself carries the movement.</p>
${[...groups].map(([key, list]) => `<h2>${esc(key)}</h2><div class="row">${list.map((c) => `<figure><figcaption><b>${esc(c.direction)}</b><span class="${c.applied !== c.direction ? 'warn' : ''}">applied: ${esc(c.applied)} · fonts: ${esc(c.fonts ?? '—')}</span></figcaption><img src="shots/${esc(c.file)}" alt="${esc(c.direction)} at ${c.width}px, ${c.scene ? 'scene visible' : 'scene hidden'}, ${esc(c.page)}"></figure>`).join('')}</div>`).join('')}
`;
await writeFile(join(OUT, 'sheet.html'), html);
console.log(`\nsheet → tools/out/sheet.html (${cells.length} shots)`);
