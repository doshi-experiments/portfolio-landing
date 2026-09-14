/* Foundations the resolver reads. The static half (spacing scale, type
 * scale, page width) lives in src/styles/base.css as plain custom properties;
 * this file holds only the multipliers that visitor controls move. */

export const DISPLAY_SCALE = { compact: 0.82, standard: 1, grand: 1.18 } as const;

/** displayEmphasis / headlineEmphasis steps −1 · 0 · 1 */
export const EMPHASIS_STEP = { '-1': 0.9, '0': 1, '1': 1.12 } as const;

/** Density moves layout spacing only — never text size or control targets. */
export const DENSITY = { comfortable: 1, compact: 0.72 } as const;

/** Spaciousness steps −1 · 0 · 1 · 2 (Arts and Crafts, Minimalism). */
export const SPACIOUSNESS_STEP = { '-1': 0.85, '0': 1, '1': 1.25, '2': 1.5 } as const;

/** Ornament levels map to a finite amount the CSS reads. */
export const ORNAMENT_AMOUNT = { off: 0, low: 0.5, full: 1 } as const;

export const READING_SIZE_FACTOR = { 100: 1, 112.5: 1.125, 125: 1.25 } as const;

/** Hover/active are derived, not authored: a bounded lightness shift in OKLCH. */
export const HOVER_DL = -0.06;
export const ACTIVE_DL = -0.1;
export const MUTED_DL = 0.22;
