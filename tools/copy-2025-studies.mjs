#!/usr/bin/env node
// Copies the archived 2025 pages a reader can reach from this site into it: the three studies at
// /<study>/2025/, and About, Wells Fargo and Rural ANM under /2025/. A reader who opens one stays on
// this site: the wordmark and Work lead home, links between them open the copies, and the footer
// says the copy is AI's rebuild of the hand-made Framer original.
// The archive keeps its own links, so a reader who enters it from /versions/ stays in 2025. Assets,
// styles and scripts stay in the archive and are shared. Rerun after editing an archived study;
// --check fails when a copy is out of date, and CI runs it.
// Run from anywhere: node tools/copy-2025-studies.mjs [--check]
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const archive = '/versions/2025-framer/';
const pages = {
  shipment: 'shipment/2025', genai: 'genai/2025', healthcare: 'healthcare/2025',
  about: '2025/about', 'wells-fargo': '2025/wells-fargo', anm: '2025/anm',
};
const links = {[archive]: '/', ...Object.fromEntries(Object.entries(pages).map(([from, to]) => [`${archive}${from}/`, `/${to}/`]))};
const checkOnly = process.argv.includes('--check');
const stale = [];

for (const [from, to] of Object.entries(pages)) {
  const source = `versions/2025-framer/${from}/index.html`;
  const target = `${to}/index.html`;
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
