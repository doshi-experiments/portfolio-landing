/* Server-only: the educational copy for each built direction. Imported by
 * .astro components at build time; never from src/client. */

import type { Direction, DirectionId, Education } from '@design/schema';
import { DIRECTION_DATA } from './index';
import { education as swiss } from './swiss.education';
import { education as artNouveau } from './art-nouveau.education';
import { education as brutalism } from './brutalism.education';

const EDUCATION: Partial<Record<DirectionId, Education>> = {
  swiss,
  'art-nouveau': artNouveau,
  brutalism,
};

export function direction(id: DirectionId): Direction {
  const data = DIRECTION_DATA[id];
  const education = EDUCATION[id];
  if (!data || !education) throw new Error(`Direction "${id}" is not built yet`);
  return { ...data, education };
}

export const builtDirections = (): Direction[] =>
  (Object.keys(DIRECTION_DATA) as DirectionId[]).map(direction);
