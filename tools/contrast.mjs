/* Verifies every semantic colour pair the interface actually renders, for
 * every built direction and every accent option, on the resolved sRGB
 * values — and checks that each decorative colour's declared role matches
 * its measured contrast on its own canvas and surface. Fails the build on
 * any regression. Usage: node --import ./tools/lib/register.mjs tools/contrast.mjs */
import { DIRECTION_DATA } from '@content/directions';
import { resolve } from '@design/resolve';
import { contrast } from '@design/color';
import { DEFAULT_GLOBAL } from '@design/schema';

const AA = 4.5, LARGE = 3, NON_TEXT = 3;
let failures = 0, checks = 0;
const rows = [];

function check(dir, accent, label, fg, bg, min) {
  checks++;
  const r = contrast(fg, bg);
  const ok = r >= min;
  if (!ok) failures++;
  rows.push({ dir, accent, label, fg, bg, r: r.toFixed(2), min, ok });
}

for (const d of Object.values(DIRECTION_DATA)) {
  const accent = d.controls.find((c) => c.id === 'accent');
  const options = accent && accent.kind === 'choice' ? accent.options.map((o) => o.id) : [null];
  for (const opt of options) {
    const adj = opt ? { accent: opt } : {};
    const { vars, notices } = resolve(d, adj, DEFAULT_GLOBAL);
    const v = (k) => vars[k];
    const tag = opt ?? '—';
    for (const bg of ['--color-canvas', '--color-surface']) {
      const bgName = bg.replace('--color-', '');
      check(d.id, tag, `text-primary/${bgName}`, v('--color-text-primary'), v(bg), AA);
      check(d.id, tag, `text-secondary/${bgName}`, v('--color-text-secondary'), v(bg), AA);
      check(d.id, tag, `link/${bgName}`, v('--color-link'), v(bg), AA);
      check(d.id, tag, `link-hover/${bgName}`, v('--color-link-hover'), v(bg), AA);
      check(d.id, tag, `link-visited/${bgName}`, v('--color-link-visited'), v(bg), AA);
      check(d.id, tag, `focus/${bgName}`, v('--color-focus'), v(bg), NON_TEXT);
      check(d.id, tag, `border-meaningful/${bgName}`, v('--color-border-meaningful'), v(bg), NON_TEXT);
      check(d.id, tag, `action-bg(as text)/${bgName}`, v('--color-action-bg'), v(bg), NON_TEXT);
    }
    for (const state of ['bg', 'hover-bg', 'active-bg']) {
      check(d.id, tag, `action-fg/action-${state}`, v('--color-action-fg'), v(`--color-action-${state}`), AA);
    }
    // ring geometry: the outer (ink) ring sits 2px *outside* the element over
    // the page ground; the inner (surface) ring sits between the element and
    // the outer ring. So the pairs that touch are inner/element and outer/ground.
    for (const state of ['bg', 'hover-bg', 'active-bg']) check(d.id, tag, `focus-inner/action-${state}`, v('--color-focus-inner'), v(`--color-action-${state}`), NON_TEXT);
    check(d.id, tag, 'focus-inner/focus', v('--color-focus-inner'), v('--color-focus'), NON_TEXT);
    check(d.id, tag, 'selection-fg/selection-bg', v('--color-selection-fg'), v('--color-selection-bg'), AA);
    for (const n of notices) rows.push({ dir: d.id, accent: tag, label: `notice: ${n.token}`, fg: n.requested, bg: n.applied, r: n.reason, min: '', ok: true, note: true });
  }
  /* declared roles of decorative colours */
  for (const [name, hex] of Object.entries(d.palette.decor)) {
    const role = d.palette.roles[name];
    const rc = contrast(hex, d.palette.canvas), rs = contrast(hex, d.palette.surface);
    const min = Math.min(rc, rs);
    const actual = min >= AA ? 'text' : min >= LARGE ? 'large' : 'decorative';
    const order = { decorative: 0, large: 1, text: 2 };
    checks++;
    const ok = role !== undefined && order[role] <= order[actual];
    if (!ok) failures++;
    rows.push({ dir: d.id, accent: '—', label: `decor.${name} role=${role ?? 'MISSING'} (measured ${actual})`, fg: hex, bg: `${rc.toFixed(2)}/${rs.toFixed(2)}`, r: min.toFixed(2), min: role ?? '?', ok });
  }
  {
    const rc = contrast(d.palette.rule, d.palette.canvas), rs = contrast(d.palette.rule, d.palette.surface);
    rows.push({ dir: d.id, accent: '—', label: `rule (separator, no role needed)`, fg: d.palette.rule, bg: `${rc.toFixed(2)}/${rs.toFixed(2)}`, r: Math.min(rc, rs).toFixed(2), min: '', ok: true, note: true });
  }
  for (const [name, plate] of Object.entries(d.palette.plates ?? {})) {
    const min = plate.role === 'text' ? AA : plate.role === 'large' ? LARGE : 0;
    check(d.id, '—', `plate.${name} (${plate.role})`, plate.fg, plate.bg, min);
  }
}

const fails = rows.filter((r) => !r.ok);
const pad = (s, n) => String(s).padEnd(n);
if (process.argv.includes('--all')) {
  for (const r of rows) console.log(`${r.ok ? ' ok ' : 'FAIL'} ${pad(r.dir, 16)} ${pad(r.accent, 6)} ${pad(r.label, 44)} ${pad(r.fg, 8)} on ${pad(r.bg, 12)} ${pad(r.r, 6)} ${r.min}`);
}
for (const r of rows.filter((r) => r.note && r.label.startsWith('notice'))) console.log(`note ${pad(r.dir, 16)} ${pad(r.accent, 6)} ${r.label}: ${r.fg} → ${r.bg} (${r.r})`);
for (const r of fails) console.log(`FAIL ${pad(r.dir, 16)} ${pad(r.accent, 6)} ${pad(r.label, 44)} ${pad(r.fg, 8)} on ${pad(r.bg, 12)} ${pad(r.r, 6)} needs ${r.min}`);
console.log(`\ncontrast: ${checks} checks, ${fails.length} failures across ${Object.keys(DIRECTION_DATA).length} direction(s)`);
process.exit(fails.length ? 1 : 0);
