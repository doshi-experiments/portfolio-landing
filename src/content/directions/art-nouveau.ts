import type { DirectionData } from '@design/schema';

export const artNouveau: DirectionData = {
  id: 'art-nouveau',
  name: 'Art Nouveau',
  tagline: 'The living line',
  period: 'c. 1890–1910',
  keywords: ['whiplash', 'asymmetry', 'organic'],
  palette: {
    canvas: '#F3EBD8',
    surface: '#FFF9EC',
    ink: '#263D35',
    action: '#526B46',
    actionFg: '#FFFFFF',
    rule: '#B39758',
    decor: { sage: '#526B46', plum: '#8B4C62', gold: '#B39758' },
    // measured: sage 4.98/5.64 → text; plum 5.35/6.05 → text; gold 2.36/2.67 → decorative only
    roles: { sage: 'text', plum: 'text', gold: 'decorative', rule: 'decorative' },
  },
  typography: {
    display: { family: 'cormorant-garamond', weights: [500, 600], italic: true },
    body: { family: 'source-sans-3', weights: [400, 600] },
    displayScale: 'grand',
    labelTracking: '0.02em',
    labelCase: 'sentence',
  },
  recipe: {
    hero: 'framed-asymmetric',
    project: 'vertical-frame',
    sectionHeading: 'ornamental-baseline',
    frame: 'botanical-corner',
    ornament: 'whiplash',
    radius: 0,
    ruleWeight: 1,
    surface: 'flat',
    motion: { feedbackMs: 180, reveal: 'draw-line', revealMs: 500 },
    scene: {
      id: 'metro-entrance',
      reference: {
        kind: 'specific',
        subject: 'structure',
        title: 'the Métropolitain entrance',
        maker: 'Hector Guimard',
        year: '1900',
        place: 'Paris',
        note: 'Stems, canopy and lamps are original SVG plates standing in 3D; the proportions are simplified.',
      },
      treatment: 'ornamented',
      assembly: 'draw',
      assembleMs: 1400,
      camera: { yaw: -22, pitch: -12, scale: 0.9 },
    },
  },
  controls: [
    {
      id: 'accent', kind: 'choice', label: 'Accent',
      options: [
        { id: 'sage', label: 'Sage', value: '#526B46' },
        { id: 'plum', label: 'Plum', value: '#8B4C62' },
        { id: 'ink', label: 'Ink', value: '#263D35' },
      ],
      default: 'sage', affects: ['css', 'decor', 'ui'],
    },
    { id: 'lineDetail', kind: 'level', label: 'Line detail', levels: ['off', 'low', 'full'], default: 'full', affects: ['css', 'decor', 'scene'] },
    { id: 'displayEmphasis', kind: 'steps', label: 'Display emphasis', steps: [-1, 0, 1], stepLabels: ['Quieter', 'Standard', 'Stronger'], default: 0, affects: ['css'] },
  ],
  remix: { allowedEffects: [] },
};
