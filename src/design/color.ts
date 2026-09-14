/* Colour maths shared by the resolver, the Remix guard and tools/contrast.mjs.
 *
 * Hex anchors are authoritative. OKLCH is used only to *derive* neighbours
 * (hover, active, a muted text tone) and to move a failing foreground along
 * lightness until it passes. Contrast is always measured on the resolved
 * sRGB pair — never inferred from the L channel. No dependencies. */

import type { Hex } from './schema';

export interface RGB { r: number; g: number; b: number }          // 0–1, gamma-encoded
export interface OKLCH { l: number; c: number; h: number }        // l 0–1, h degrees

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function hexToRgb(hex: string): RGB {
  const s = hex.replace('#', '');
  const n = s.length === 3 ? s.split('').map((ch) => ch + ch).join('') : s;
  const v = parseInt(n, 16);
  return { r: ((v >> 16) & 255) / 255, g: ((v >> 8) & 255) / 255, b: (v & 255) / 255 };
}

export function rgbToHex({ r, g, b }: RGB): Hex {
  const to = (v: number) => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase() as Hex;
}

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

/** WCAG relative luminance. */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG 2.x contrast ratio, 1–21. */
export function contrast(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/* ── OKLab / OKLCH (Björn Ottosson) ─────────────────────────────── */

export function rgbToOklch(rgb: RGB): OKLCH {
  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.hypot(A, B);
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}

function oklchToLinear({ l, c, h }: OKLCH) {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return {
    r: 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    g: -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    b: -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  };
}

const inGamut = (lin: { r: number; g: number; b: number }) =>
  [lin.r, lin.g, lin.b].every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/** OKLCH → sRGB with chroma reduction until the colour is inside the gamut.
 *  Lightness and hue are preserved; chroma is the axis we give up. */
export function oklchToRgb(col: OKLCH): RGB {
  const l = clamp01(col.l);
  let c = Math.max(0, col.c);
  let lin = oklchToLinear({ l, c, h: col.h });
  if (!inGamut(lin)) {
    let lo = 0;
    let hi = c;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear({ l, c: mid, h: col.h }))) lo = mid;
      else hi = mid;
    }
    c = lo;
    lin = oklchToLinear({ l, c, h: col.h });
  }
  return { r: clamp01(toGamma(clamp01(lin.r))), g: clamp01(toGamma(clamp01(lin.g))), b: clamp01(toGamma(clamp01(lin.b))) };
}

export const hexToOklch = (hex: string) => rgbToOklch(hexToRgb(hex));
export const oklchToHex = (c: OKLCH) => rgbToHex(oklchToRgb(c));

/** Shift lightness by `dl` (−1…1) keeping hue and chroma (gamut-clipped). */
export function shiftL(hex: string, dl: number): Hex {
  const c = hexToOklch(hex);
  return oklchToHex({ ...c, l: clamp01(c.l + dl) });
}

/** Move `fg` along OKLCH lightness — away from `bg` — until contrast ≥ `min`.
 *  Returns the original when it already passes. Chroma and hue are kept, so
 *  a sage stays sage; only its depth changes. Returns null when no lightness
 *  reaches the target (which only happens for mid-grey backgrounds). */
export function ensureContrast(fg: string, bg: string, min: number): { hex: Hex; adjusted: boolean } {
  if (contrast(fg, bg) >= min) return { hex: fg.toUpperCase() as Hex, adjusted: false };
  const base = hexToOklch(fg);
  const darkerIsBetter = luminance(bg) > 0.18; // light background → push the foreground darker
  const step = darkerIsBetter ? -0.01 : 0.01;
  let l = base.l;
  for (let i = 0; i < 100; i++) {
    l = clamp01(l + step);
    const hex = oklchToHex({ ...base, l });
    if (contrast(hex, bg) >= min) return { hex, adjusted: true };
    if (l === 0 || l === 1) break;
  }
  // Last resort: the far pole, which always passes against a light or dark ground.
  const pole = darkerIsBetter ? '#000000' : '#FFFFFF';
  return { hex: pole as Hex, adjusted: true };
}

export const AA_TEXT = 4.5;
export const AA_LARGE = 3;
export const AA_NON_TEXT = 3;
