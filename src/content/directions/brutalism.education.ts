import type { Education } from '@design/schema';

export const education: Education = {
  context:
    'Brutalism is principally an architectural movement of the postwar decades: conspicuous structure, ' +
    'material directness, and often — though not only — exposed concrete. This page is a contemporary ' +
    'digital interpretation of mass and exposed organisation, not a claim that the architecture and ' +
    'web brutalism are one historical movement.',
  refs: [
    { label: 'Chicago Architecture Center: Brutalism', url: 'https://www.architecture.org/city-tours/brutalism-concrete-made-beautiful' },
    { label: 'Brutalist architecture (overview)', url: 'https://en.wikipedia.org/wiki/Brutalist_architecture' },
  ],
  onThisPage: [
    'The page is stacked full-width slabs with heavy rules; the reading column stays narrow inside them.',
    'Headings are index blocks — a solid number and a heavy display face — and captions are bolted to their frames.',
    'No shadows, no gloss, no texture: the structure is the finish.',
  ],
  interpretation:
    'Archivo Black and IBM Plex are modern faces chosen for weight and plainness. The Habitat 67 model is ' +
    'simplified and sits in its own slab. Nothing is deliberately broken; a heavy page can still be a usable one.',
};
