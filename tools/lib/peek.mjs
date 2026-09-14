/* Quick viewport-only shots for eyeballing the top of a page during work:
 *   node tools/lib/peek.mjs <direction> <width> <height> [path] */
import { serve } from './serve.mjs';
import { launch, newPage, settle } from './browser.mjs';
const [direction = 'swiss', w = '390', h = '1200', path = '/'] = process.argv.slice(2);
const server = await serve(new URL('../../dist', import.meta.url).pathname);
const browser = await launch();
const page = await newPage(browser, { width: Number(w), height: Number(h), direction });
await page.goto(server.url + path, { waitUntil: 'load' });
await settle(page);
await page.waitForSelector('.scene__stage.settled', { timeout: 6000 }).catch(() => {});
const out = `tools/out/shots/_peek-${direction}-${w}.png`;
await page.screenshot({ path: out });
console.log(out);
await browser.close(); await server.close();
