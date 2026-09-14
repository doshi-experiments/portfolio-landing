/* Launch a browser for the tools: the installed Google Chrome when there is
 * one (no download), else Playwright's own Chromium. */
import { chromium } from 'playwright';

export async function launch() {
  try {
    return await chromium.launch({ channel: 'chrome', headless: true });
  } catch {
    return await chromium.launch({ headless: true });
  }
}

/** Persisted-state init script: the real boot path, not a query override. */
export const persistedState = (direction, extra = {}) => ({
  v: 1, direction, tune: {}, remix: {}, global: { readingSize: 100, reduceEffects: false, ...(extra.global || {}) }, ...extra,
});

/**
 * @param {import('playwright').Browser} browser
 * @param {{ width: number, height: number, direction?: string, scene?: boolean, readingSize?: number, reduceEffects?: boolean, reducedMotion?: boolean }} opts
 */
export async function newPage(browser, { width, height, direction, scene = true, readingSize = 100, reduceEffects = false, reducedMotion = false }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });
  if (direction) {
    const state = persistedState(direction, { global: { readingSize, reduceEffects } });
    await context.addInitScript((s) => { try { localStorage.setItem('rd.artdirection', JSON.stringify(s)); } catch {} }, state);
  }
  const page = await context.newPage();
  return page;
}

export async function settle(page, ms = 400) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true', null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(ms);
}
