#!/usr/bin/env node
// Copies the three archived 2025 studies into the live site at /<study>/2025/, so a reader who opens
// one from this site stays on it: the wordmark and Work lead home and the next study opens its copy,
// and the footer says the copy is AI's rebuild of the hand-made Framer original.
// The archive keeps its own links, so a reader who enters it from /versions/ stays in 2025. Assets,
// styles and scripts stay in the archive and are shared. Rerun after editing an archived study;
// --check fails when a copy is out of date, and CI runs it.
// Run from anywhere: node tools/copy-2025-studies.mjs [--check]
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const archive = '/versions/2025-framer/';
const studies = ['shipment', 'genai', 'healthcare'];
const links = {[archive]: '/', ...Object.fromEntries(studies.map(s => [`${archive}${s}/`, `/${s}/2025/`]))};
const checkOnly = process.argv.includes('--check');
const stale = [];

for (const study of studies) {
  const source = `versions/2025-framer/${study}/index.html`;
  const target = `${study}/2025/index.html`;
  const html = readFileSync(join(root, source), 'utf8')
    .replace(/<html[^>]*>/, tag => `${tag}\n<!-- Generated from ${source} by tools/copy-2025-studies.mjs. Edit the archive, then rerun the script. -->`)
    .replace(/href="([^"#?]*)([^"]*)"/g, (attr, path, rest) => path in links ? `href="${links[path]}${rest}"` : attr)
    .replace('I hope you have a gorgeous day!</div></footer>', 'I hope you have a gorgeous day! · Designed by hand in Framer in 2025. This copy was rebuilt from it by AI.</div></footer>');
  if (checkOnly) {
    if (!existsSync(join(root, target)) || readFileSync(join(root, target), 'utf8') !== html) stale.push(target);
    continue;
  }
  mkdirSync(dirname(join(root, target)), {recursive: true});
  writeFileSync(join(root, target), html);
  console.log(`${source} -> ${target}`);
}

if (stale.length) {
  console.error(`Out of date with the archive: ${stale.join(', ')}. Run node tools/copy-2025-studies.mjs`);
  process.exit(1);
}
