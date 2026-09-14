/* direction + visitor adjustments + global prefs → the custom properties and
 * data attributes the stylesheets read. Pure: runs at build time for the
 * defaults baked into each direction's CSS, and at runtime for Tune/Remix.
 *
 * Every derived colour is verified with real WCAG contrast on the resolved
 * sRGB pair; a failing pair is moved along OKLCH lightness and reported in
 * `notices`, so the UI can say "applied #… (darkened for contrast)". */

import { AA_TEXT, contrast, ensureContrast, shiftL } from './color';
import {
  ACTIVE_DL, DENSITY, DISPLAY_SCALE, EMPHASIS_STEP, HOVER_DL, MUTED_DL,
  ORNAMENT_AMOUNT, READING_SIZE_FACTOR, SPACIOUSNESS_STEP,
} from './foundations';
import type { Adjustments, ControlSpec, DirectionData, GlobalPrefs, Hex } from './schema';

export interface Resolved {
  vars: Record<string, string>;
  data: Record<string, string>;
  /** Contrast corrections that changed an authored/selected value. */
  notices: { token: string; requested: string; applied: string; reason: string }[];
  /** The adjustments actually in effect after validation. */
  adjustments: Adjustments;
}

const LEVEL_CONTROLS = new Set(['ornament', 'lineDetail', 'frameDetail', 'geometry', 'diagonal', 'halftone', 'pattern']);

/** Drop unknown keys and invalid values; fill defaults. */
export function validateAdjustments(controls: ControlSpec[], input: Adjustments | undefined): Adjustments {
  const out: Adjustments = {};
  for (const c of controls) {
    const v = input?.[c.id];
    switch (c.kind) {
      case 'choice':
        out[c.id] = typeof v === 'string' && c.options.some((o) => o.id === v) ? v : c.default;
        break;
      case 'level':
        out[c.id] = typeof v === 'string' && (c.levels as string[]).includes(v) ? v : c.default;
        break;
      case 'steps':
        out[c.id] = typeof v === 'number' && c.steps.includes(v) ? v : c.default;
        break;
    }
  }
  return out;
}

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
const fontVar = (family: string) => `var(--font-${family})`;

export function resolve(d: DirectionData, input: Adjustments | undefined, global: GlobalPrefs): Resolved {
  const adj = validateAdjustments(d.controls, input);
  const notices: Resolved['notices'] = [];
  const vars: Record<string, string> = {};
  const data: Record<string, string> = { direction: d.id };
  const p = d.palette;

  const fix = (token: string, fg: string, bg: string, min: number, reason: string): Hex => {
    const r = ensureContrast(fg, bg, min);
    if (r.adjusted) notices.push({ token, requested: fg.toUpperCase(), applied: r.hex, reason });
    return r.hex;
  };

  /* ── colour ─────────────────────────────────────────────────── */
  let action: string = p.action;
  const accent = d.controls.find((c): c is Extract<ControlSpec, { id: 'accent' }> => c.id === 'accent');
  if (accent) {
    const chosen = accent.options.find((o) => o.id === adj['accent']);
    if (chosen) action = chosen.value;
  }
  // Foreground on the action colour must read; when it doesn't, deepen the
  // action rather than tint the foreground, so the accent stays recognisable.
  if (contrast(p.actionFg, action) < AA_TEXT) action = fix('action', action, p.actionFg, AA_TEXT, 'deepened so the label reads');
  const hover = fix('action-hover', shiftL(action, HOVER_DL), p.actionFg, AA_TEXT, 'deepened so the label reads');
  const active = fix('action-active', shiftL(action, ACTIVE_DL), p.actionFg, AA_TEXT, 'deepened so the label reads');

  // Links are body-size text on both grounds.
  let link: string = p.link ?? action;
  link = fix('link', link, p.canvas, AA_TEXT, 'darkened for contrast on the canvas');
  link = fix('link', link, p.surface, AA_TEXT, 'darkened for contrast on the surface');
  const linkHover = fix('link-hover', shiftL(link, HOVER_DL), p.canvas, AA_TEXT, 'darkened for contrast');

  let muted: string = p.inkMuted ?? shiftL(p.ink, MUTED_DL);
  muted = fix('text-secondary', muted, p.canvas, AA_TEXT, 'darkened for contrast on the canvas');
  muted = fix('text-secondary', muted, p.surface, AA_TEXT, 'darkened for contrast on the surface');

  Object.assign(vars, {
    '--color-canvas': p.canvas,
    '--color-surface': p.surface,
    '--color-text-primary': p.ink,
    '--color-text-secondary': muted,
    '--color-action-bg': action,
    '--color-action-fg': p.actionFg,
    '--color-action-hover-bg': hover,
    '--color-action-active-bg': active,
    '--color-link': link,
    '--color-link-hover': linkHover,
    '--color-link-visited': link,
    // A two-tone ring passes ≥ 3:1 against canvas, surface and the action
    // colour alike: ink outside, surface inside.
    '--color-focus': p.ink,
    '--color-focus-inner': p.surface,
    '--color-selection-bg': action,
    '--color-selection-fg': p.actionFg,
    '--color-rule': p.rule,
    '--color-border-meaningful': p.ink,
  });
  for (const [name, hex] of Object.entries(p.decor)) vars[`--color-decor-${kebab(name)}`] = hex;
  for (const [name, plate] of Object.entries(p.plates ?? {})) {
    vars[`--color-plate-${kebab(name)}-bg`] = plate.bg;
    vars[`--color-plate-${kebab(name)}-fg`] = plate.fg;
  }

  /* ── type ───────────────────────────────────────────────────── */
  const t = d.typography;
  const emphasisKey = ('displayEmphasis' in adj ? adj['displayEmphasis'] : adj['headlineEmphasis'] ?? 0) as number;
  const emphasis = EMPHASIS_STEP[String(emphasisKey) as keyof typeof EMPHASIS_STEP] ?? 1;
  Object.assign(vars, {
    '--type-display-family': fontVar(t.display.family),
    '--type-body-family': fontVar(t.body.family),
    '--type-ui-family': fontVar((t.ui ?? t.body).family),
    '--type-mono-family': t.mono ? fontVar(t.mono.family) : 'ui-monospace, Menlo, monospace',
    '--type-display-weight': String(Math.max(...t.display.weights)),
    '--type-body-weight': String(Math.min(...t.body.weights)),
    '--type-display-factor': (DISPLAY_SCALE[t.displayScale] * emphasis).toFixed(3),
    '--type-label-tracking': t.labelTracking,
    '--type-label-transform': t.labelCase === 'upper' ? 'uppercase' : 'none',
    '--type-reading-size': String(READING_SIZE_FACTOR[global.readingSize]),
  });

  /* ── layout, geometry, effects, motion ──────────────────────── */
  const density = DENSITY[(adj['density'] as keyof typeof DENSITY) ?? 'comfortable'] ?? 1;
  const spac = SPACIOUSNESS_STEP[String(adj['spaciousness'] ?? adj['spacing'] ?? 0) as keyof typeof SPACIOUSNESS_STEP] ?? 1;
  const r = d.recipe;
  const level = d.controls.find((c) => c.kind === 'level' && LEVEL_CONTROLS.has(c.id));
  const ornamentLevel = level ? String(adj[level.id]) : r.ornament === 'none' ? 'off' : 'full';
  const ruleStep = typeof adj['ruleWeight'] === 'number' ? (adj['ruleWeight'] as number) : 0;
  const edgeStep = typeof adj['edgeWeight'] === 'number' ? (adj['edgeWeight'] as number) : 0;
  Object.assign(vars, {
    '--layout-density': (density * spac).toFixed(3),
    '--layout-reading-measure': '64ch',
    '--border-structural-width': `${Math.max(1, r.ruleWeight + ruleStep + edgeStep)}px`,
    '--radius': r.radius === 'mixed' ? '6px' : `${r.radius}px`,
    '--effect-ornament-amount': String(ORNAMENT_AMOUNT[ornamentLevel as keyof typeof ORNAMENT_AMOUNT] ?? 1),
    '--motion-feedback-duration': `${global.reduceEffects ? 0 : r.motion.feedbackMs}ms`,
    '--motion-reveal-duration': `${global.reduceEffects || r.motion.reveal === 'none' ? 0 : r.motion.revealMs ?? 0}ms`,
  });

  /* ── data attributes: one per control plus the shared ones ──── */
  for (const [id, value] of Object.entries(adj)) data[kebab(id)] = String(value);
  data['ornament'] = ornamentLevel;
  data['density'] = String(adj['density'] ?? 'comfortable');
  data['reading-size'] = String(global.readingSize);
  data['reduce-effects'] = global.reduceEffects ? 'true' : 'false';
  data['hero'] = r.hero;
  data['project'] = r.project;
  data['heading'] = r.sectionHeading;
  data['frame'] = r.frame;
  data['surface'] = r.surface;
  data['treatment'] = r.scene.treatment;

  return { vars, data, notices, adjustments: adj };
}

/** Serialise resolved vars as a declaration block (for build-time CSS). */
export const toDeclarations = (vars: Record<string, string>) =>
  Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';');
