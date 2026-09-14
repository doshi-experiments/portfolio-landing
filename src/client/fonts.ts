/* Load exactly the faces a direction uses, bounded by a timeout. Astro gives
 * each family a hashed name inside its --font-<id> variable, so the family
 * is read from the variable rather than typed by hand. A miss is not an
 * error: the metric-matched fallback is already declared, and the caller
 * marks the document so the sheet can be honest about it. */

import type { DirectionData, FaceRef } from '@design/schema';

export type FontOutcome = 'ok' | 'fallback' | 'unsupported';

function familyFromVar(cssVariable: string): string | null {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(cssVariable).trim();
  if (!raw) return null;
  const first = raw.split(',')[0]?.trim() ?? '';
  return first.replace(/^["']|["']$/g, '') || null;
}

function specs(face: FaceRef): string[] {
  const fam = familyFromVar(`--font-${face.family}`);
  if (!fam) return [];
  const out: string[] = [];
  for (const w of face.weights) {
    out.push(`${w} 1em "${fam}"`);
    if (face.italic) out.push(`italic ${w} 1em "${fam}"`);
  }
  return out;
}

export async function loadFonts(d: DirectionData, timeoutMs = 2500): Promise<FontOutcome> {
  if (!('fonts' in document) || typeof document.fonts.load !== 'function') return 'unsupported';
  const t = d.typography;
  const faces = [t.display, t.body, t.ui, t.mono].filter((f): f is FaceRef => !!f);
  const wanted = faces.flatMap(specs);
  if (wanted.length === 0) return 'fallback';
  const all = Promise.all(wanted.map((s) => document.fonts.load(s)));
  const timeout = new Promise<'timeout'>((r) => setTimeout(() => r('timeout'), timeoutMs));
  try {
    const result = await Promise.race([all.then(() => 'ok' as const), timeout]);
    if (result === 'timeout') return 'fallback';
    // load() resolves with the matched faces; an empty array means the
    // family exists but nothing matched (a static face at a missing weight)
    return 'ok';
  } catch {
    return 'fallback';
  }
}
