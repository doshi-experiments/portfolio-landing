/* Visitor preferences, versioned, in localStorage — with an in-memory
 * fallback when storage is blocked. Nothing here trusts stored data: the
 * shape is checked field by field and anything off is dropped, not repaired.
 *
 * `cache` is the resolved-token stamp the pre-paint boot applies before any
 * module runs. It is keyed to the design-system build id so a stale cache
 * from an older deploy is ignored rather than painted. */

import type { Adjustments, DirectionId, GlobalPrefs } from '@design/schema';
import { DEFAULT_GLOBAL, DIRECTION_IDS, READING_SIZES } from '@design/schema';

export const STORAGE_KEY = 'rd.artdirection';
export const SCHEMA_VERSION = 1 as const;

export interface TokenCache {
  buildId: string;
  direction: DirectionId;
  vars: Record<string, string>;
  data: Record<string, string>;
}

export interface Persisted {
  v: typeof SCHEMA_VERSION;
  direction: DirectionId;
  tune: Partial<Record<DirectionId, Adjustments>>;
  remix: Partial<Record<DirectionId, Record<string, unknown>>>;
  global: GlobalPrefs;
  cache?: TokenCache;
}

let memory: Persisted | null = null;

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const isDirectionId = (v: unknown): v is DirectionId => typeof v === 'string' && (DIRECTION_IDS as readonly string[]).includes(v);

function sanitizeAdjustments(v: unknown): Adjustments | null {
  if (!isRecord(v)) return null;
  const out: Adjustments = {};
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === 'string' || typeof val === 'number') out[k] = val;
  }
  return out;
}

function sanitize(raw: unknown): Persisted | null {
  if (!isRecord(raw) || raw['v'] !== SCHEMA_VERSION) return null;
  const direction = isDirectionId(raw['direction']) ? raw['direction'] : null;
  if (!direction) return null;
  const tune: Persisted['tune'] = {};
  if (isRecord(raw['tune'])) {
    for (const [k, v] of Object.entries(raw['tune'])) {
      const adj = isDirectionId(k) ? sanitizeAdjustments(v) : null;
      if (adj) tune[k as DirectionId] = adj;
    }
  }
  const remix: Persisted['remix'] = {};
  if (isRecord(raw['remix'])) {
    for (const [k, v] of Object.entries(raw['remix'])) if (isDirectionId(k) && isRecord(v)) remix[k] = v;
  }
  const g = isRecord(raw['global']) ? raw['global'] : {};
  const global: GlobalPrefs = {
    readingSize: (READING_SIZES as readonly number[]).includes(g['readingSize'] as number) ? (g['readingSize'] as GlobalPrefs['readingSize']) : DEFAULT_GLOBAL.readingSize,
    reduceEffects: g['reduceEffects'] === true,
  };
  let cache: TokenCache | undefined;
  const c = raw['cache'];
  if (isRecord(c) && typeof c['buildId'] === 'string' && isDirectionId(c['direction']) && isRecord(c['vars']) && isRecord(c['data'])) {
    const strMap = (m: Record<string, unknown>) => Object.fromEntries(Object.entries(m).filter((e): e is [string, string] => typeof e[1] === 'string'));
    cache = { buildId: c['buildId'], direction: c['direction'], vars: strMap(c['vars']), data: strMap(c['data']) };
  }
  return { v: SCHEMA_VERSION, direction, tune, remix, global, cache };
}

export function load(): Persisted | null {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitize(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function save(state: Persisted): void {
  memory = state;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* blocked or full: the in-memory copy carries the session */
  }
}

export function clear(): void {
  memory = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}

export const fresh = (direction: DirectionId): Persisted => ({
  v: SCHEMA_VERSION, direction, tune: {}, remix: {}, global: { ...DEFAULT_GLOBAL },
});
