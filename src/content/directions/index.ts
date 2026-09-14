/* Direction registry.
 *
 * `DIRECTION_DATA` is what the client bundle carries: palettes, type, recipe,
 * controls — a few hundred bytes each. Education prose lives beside each
 * direction in `<id>.education.ts` and is only ever imported on the server
 * (see `education.ts`), so it is rendered into the HTML once and never
 * shipped as JavaScript. Directions are added here as they are built; the
 * twelve ids are fixed in the schema regardless. */

import type { DirectionData, DirectionId } from '@design/schema';
import { swiss } from './swiss';
import { artNouveau } from './art-nouveau';
import { brutalism } from './brutalism';

export const DIRECTION_DATA: Partial<Record<DirectionId, DirectionData>> = {
  swiss,
  'art-nouveau': artNouveau,
  brutalism,
};

/** Ids with a built direction, in the order the gallery shows them. */
export const BUILT_DIRECTIONS = Object.keys(DIRECTION_DATA) as DirectionId[];

export function directionData(id: DirectionId): DirectionData {
  const d = DIRECTION_DATA[id];
  if (!d) throw new Error(`Direction "${id}" is not built yet`);
  return d;
}

export const isBuilt = (id: string): id is DirectionId => id in DIRECTION_DATA;
