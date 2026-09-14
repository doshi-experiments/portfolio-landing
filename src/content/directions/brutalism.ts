import type { DirectionData } from '@design/schema';

export const brutalism: DirectionData = {
  id: 'brutalism',
  name: 'Brutalism',
  tagline: 'Structure exposed',
  period: 'c. 1950s–1970s',
  keywords: ['mass', 'structure', 'concrete'],
  palette: {
    canvas: '#DAD8D1',
    surface: '#ECEAE4',
    ink: '#171717',
    inkMuted: '#50504A',
    action: '#993C23',
    actionFg: '#FFFFFF',
    rule: '#171717',
    decor: { rust: '#993C23', orange: '#D15A32' },
    // measured: rust 4.87/5.77 → text; orange 2.82 on canvas → decorative only (3.34 on surface is not enough everywhere)
    roles: { rust: 'text', orange: 'decorative', rule: 'text' },
  },
  typography: {
    display: { family: 'archivo-black', weights: [400] },
    body: { family: 'ibm-plex-sans', weights: [400, 500, 600] },
    mono: { family: 'ibm-plex-mono', weights: [400] },
    displayScale: 'grand',
    labelTracking: '0.04em',
    labelCase: 'upper',
  },
  recipe: {
    hero: 'slab-block',
    project: 'slab-row',
    sectionHeading: 'index-block',
    frame: 'structural',
    ornament: 'none',
    radius: 0,
    ruleWeight: 3,
    surface: 'flat',
    motion: { feedbackMs: 120, reveal: 'none' },
    scene: {
      id: 'habitat-67',
      reference: {
        kind: 'specific',
        subject: 'building',
        title: 'Habitat 67',
        maker: 'Moshe Safdie',
        year: '1967',
        place: 'Montréal',
        note: 'Stacked, stepped-back concrete modules; the count and the terraces are simplified.',
      },
      treatment: 'mass',
      assembly: 'drop',
      assembleMs: 1200,
      camera: { yaw: -34, pitch: -20, scale: 0.9 },
    },
  },
  controls: [
    {
      id: 'accent', kind: 'choice', label: 'Accent',
      options: [
        { id: 'rust', label: 'Rust', value: '#993C23' },
        { id: 'neutral', label: 'Neutral', value: '#171717' },
      ],
      default: 'rust', affects: ['css', 'ui'],
    },
    { id: 'edgeWeight', kind: 'steps', label: 'Edge weight', steps: [-1, 0, 1], stepLabels: ['Lighter', 'Standard', 'Heavier'], default: 0, affects: ['css', 'scene'] },
    { id: 'density', kind: 'choice', label: 'Density', options: [{ id: 'comfortable', label: 'Comfortable' }, { id: 'compact', label: 'Compact' }], default: 'comfortable', affects: ['css'] },
  ],
  remix: { allowedEffects: ['texture'] },
};
