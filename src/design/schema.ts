/* The typed source of truth for the art-direction system.
 *
 * A Direction is data: a palette, a type pairing, a recipe (finite enums that
 * select CSS behaviour), the bounded controls a visitor may tune, the scene
 * that sits in the hero, and the educational copy. Nothing in here is
 * executable CSS — a recipe value selects a rule set that already exists in
 * `src/styles/directions/<id>.css`. */

export const DIRECTION_IDS = [
  'arts-and-crafts',
  'art-nouveau',
  'art-deco',
  'de-stijl',
  'bauhaus',
  'constructivism',
  'swiss',
  'brutalism',
  'minimalism',
  'pop-art',
  'op-art',
  'memphis',
] as const;
export type DirectionId = (typeof DIRECTION_IDS)[number];
export const DEFAULT_DIRECTION: DirectionId = 'swiss';

export type Hex = `#${string}`;

/** What a colour is allowed to carry, decided from measured contrast against
 *  the palette's own canvas and surface (see tools/contrast.mjs):
 *  text ≥ 4.5:1 · large ≥ 3:1 (≥ 24px, or 19px bold, and meaningful non-text)
 *  · decorative < 3:1 (never text, never focus/borders/icons that carry meaning). */
export type ColorRole = 'text' | 'large' | 'decorative';

export const FONT_FAMILY_IDS = [
  'inter',
  'source-serif-4',
  'source-sans-3',
  'cormorant-garamond',
  'josefin-sans',
  'jost',
  'oswald',
  'ibm-plex-sans',
  'ibm-plex-mono',
  'archivo-black',
  'space-grotesk',
] as const;
export type FontFamilyId = (typeof FONT_FAMILY_IDS)[number];

export interface FaceRef {
  family: FontFamilyId;
  /** Weights the recipe actually uses; fonts.ts loads exactly these. */
  weights: number[];
  italic?: boolean;
}

export interface Plate {
  bg: Hex;
  fg: Hex;
  role: ColorRole;
}

export interface Palette {
  canvas: Hex;
  surface: Hex;
  ink: Hex;
  /** Secondary text. Derived to ≥ 4.5:1 on both canvas and surface when absent. */
  inkMuted?: Hex;
  action: Hex;
  actionFg: Hex;
  link?: Hex;
  rule: Hex;
  /** Named decorative colours, exposed as --color-decor-<name>. */
  decor: Record<string, Hex>;
  /** Role of every decor colour (and of `rule`) on canvas/surface. */
  roles: Record<string, ColorRole>;
  /** Coloured backgrounds that may carry text; verified as pairs. */
  plates?: Record<string, Plate>;
}

export interface Typography {
  display: FaceRef;
  body: FaceRef;
  /** Controls and metadata. Falls back to body. */
  ui?: FaceRef;
  /** Token inspector and compact indices only. */
  mono?: FaceRef;
  displayScale: 'compact' | 'standard' | 'grand';
  /** Applied to short labels only, never paragraphs. */
  labelTracking: string;
  labelCase: 'sentence' | 'upper';
}

export type HeroRecipe =
  | 'title-page' | 'framed-asymmetric' | 'axial-stepped' | 'plane-composition'
  | 'construction-pair' | 'poster-wedge' | 'grid-8-4' | 'slab-block'
  | 'quiet-opening' | 'headline-plate' | 'split-optical' | 'assemblage';
export type ProjectRecipe =
  | 'editorial-spread' | 'vertical-frame' | 'framed-plate-pair' | 'compartment'
  | 'module-scale' | 'alternating-band' | 'open-grid' | 'slab-row'
  | 'repeat-module' | 'panel' | 'offset-frame' | 'alternating-recipe';
export type SectionHeadingRecipe =
  | 'chapter' | 'ornamental-baseline' | 'axial' | 'rule-plane' | 'geometric-marker'
  | 'numbered-bar' | 'margin-number' | 'index-block' | 'quiet' | 'plate'
  | 'thin-frame' | 'playful';
export type FrameRecipe =
  | 'rule-1' | 'botanical-corner' | 'double-hairline' | 'shared-rules' | 'none'
  | 'rule-2-3' | 'hairline' | 'structural' | 'borderless' | 'outline-offset'
  | 'thin-offset' | 'mixed-radius-offset';
export type OrnamentRecipe =
  | 'none' | 'botanical-repeat' | 'whiplash' | 'fan-fluting' | 'geometric'
  | 'diagonal-wedge' | 'halftone' | 'optical-dividers' | 'memphis-pattern';
export type RevealKind = 'none' | 'fade' | 'draw-line' | 'vertical' | 'wedge' | 'translate';

export type SceneTreatment =
  | 'plan' | 'flat' | 'planes' | 'fluted' | 'outlined' | 'mass'
  | 'quiet' | 'ornamented' | 'print' | 'optical' | 'assemblage';
export type SceneAssembly = 'drop' | 'fade' | 'draw' | 'none';

export const SCENE_IDS = [
  'dessau', 'hfg-ulm', 'metro-entrance', 'habitat-67', 'red-house', 'setback-tower',
  'schroder-house', 'pravda-tower', 'judd-marfa', 'monument-pencil', 'vasarely', 'memphis-pavilion',
] as const;
export type SceneId = (typeof SCENE_IDS)[number];

/** Every scene names what it is after, honestly: a specific work, an analogy
 *  standing in for a movement that has no building, or an original piece
 *  assembled from the movement's vocabulary. The caption is generated from
 *  this, so it can't drift from the model. */
export interface SceneRef {
  kind: 'specific' | 'analogy' | 'original';
  subject: 'building' | 'sculpture' | 'object' | 'structure';
  title: string;
  maker?: string;
  year?: string;
  place?: string;
  /** What the model simplifies or departs from. */
  note: string;
}

export interface SceneSpec {
  id: SceneId;
  reference: SceneRef;
  treatment: SceneTreatment;
  assembly: SceneAssembly;
  assembleMs: number;
  camera: { yaw: number; pitch: number; scale: number };
  crane?: boolean;
}

export interface Recipe {
  hero: HeroRecipe;
  project: ProjectRecipe;
  sectionHeading: SectionHeadingRecipe;
  frame: FrameRecipe;
  ornament: OrnamentRecipe;
  radius: 0 | 2 | 'mixed';
  /** Structural rule weight in px. */
  ruleWeight: number;
  surface: 'flat' | 'paper';
  motion: { feedbackMs: number; reveal: RevealKind; revealMs?: number };
  scene: SceneSpec;
}

/** Which update paths a control drives. The engine runs only the declared ones. */
export type ControlAffects = 'css' | 'decor' | 'scene' | 'ui';

export type ControlSpec =
  | {
      id: 'accent';
      kind: 'choice';
      label: string;
      options: { id: string; label: string; value: Hex }[];
      default: string;
      affects: ControlAffects[];
    }
  | {
      id: string;
      kind: 'level';
      label: string;
      levels: ('off' | 'low' | 'full')[];
      default: 'off' | 'low' | 'full';
      affects: ControlAffects[];
    }
  | {
      id: string;
      kind: 'steps';
      label: string;
      steps: number[];
      stepLabels?: string[];
      default: number;
      affects: ControlAffects[];
    }
  | {
      id: string;
      kind: 'choice';
      label: string;
      options: { id: string; label: string }[];
      default: string;
      affects: ControlAffects[];
    };

/** Tune values keyed by control id. Validated against `controls` on every use. */
export type Adjustments = Record<string, string | number>;

export type ReadingSize = 100 | 112.5 | 125;
export const READING_SIZES: readonly ReadingSize[] = [100, 112.5, 125];

export interface GlobalPrefs {
  readingSize: ReadingSize;
  reduceEffects: boolean;
}
export const DEFAULT_GLOBAL: GlobalPrefs = { readingSize: 100, reduceEffects: false };

export interface Education {
  /** 40–70 words adapted from the brief, with its reference link(s). */
  context: string;
  refs: { label: string; url: string }[];
  onThisPage: [string, string, string];
  interpretation: string;
}

export interface Direction {
  id: DirectionId;
  name: string;
  tagline: string;
  period: string;
  keywords: [string, string, string];
  palette: Palette;
  typography: Typography;
  recipe: Recipe;
  controls: ControlSpec[];
  remix: { allowedEffects: ('glass' | 'texture')[]; hueLocked?: boolean };
  education: Education;
}

/** The data half of a Direction — everything the client needs to resolve
 *  tokens, without the educational prose (which is server-rendered). */
export type DirectionData = Omit<Direction, 'education'>;
