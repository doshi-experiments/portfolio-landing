import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const ALIASES = { '@design/': 'src/design/', '@content/': 'src/content/', '@client/': 'src/client/', '@styles/': 'src/styles/' };

export async function resolve(specifier, context, next) {
  let spec = specifier;
  for (const [alias, dir] of Object.entries(ALIASES)) {
    if (spec.startsWith(alias)) { spec = pathToFileURL(join(ROOT, dir, spec.slice(alias.length))).href; break; }
  }
  if (spec.startsWith('./') || spec.startsWith('../') || spec.startsWith('file:')) {
    const base = spec.startsWith('file:') ? fileURLToPath(spec) : fileURLToPath(new URL(spec, context.parentURL));
    for (const cand of [base, base + '.ts', join(base, 'index.ts')]) {
      if (existsSync(cand) && !cand.endsWith('/')) {
        try { const { statSync } = await import('node:fs'); if (statSync(cand).isFile()) return next(pathToFileURL(cand).href, context); } catch {}
      }
    }
  }
  return next(spec, context);
}
