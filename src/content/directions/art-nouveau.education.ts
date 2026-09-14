import type { Education } from '@design/schema';

export const education: Education = {
  context:
    'Art Nouveau flourished from about 1890 until the years before the First World War, seeking a ' +
    'new decorative language for architecture, graphics and objects. Its best-known strand is ' +
    'organic and sinuous — the energetic “whiplash” line of Alphonse Mucha’s posters and Victor ' +
    'Horta’s ironwork — though more geometric variants existed. This page follows the curvilinear one.',
  refs: [
    { label: 'V&A: Art Nouveau', url: 'https://www.vam.ac.uk/collections/art-nouveau' },
    { label: 'V&A: The Whiplash', url: 'https://www.vam.ac.uk/articles/the-whiplash' },
  ],
  onThisPage: [
    'The opening text sits inside an open, asymmetric drawn frame; the curves never cross the copy.',
    'Section headings live in a narrow side column that alternates from left to right.',
    'Projects stand in tall frames with small drawn corners; the plates inside stay rectangular.',
  ],
  interpretation:
    'Cormorant Garamond is a modern interpretation, not a period face; the lines are original SVG drawn ' +
    'for this page; and the Métro entrance is a simplified model, not a reproduction. Controls stay ' +
    'square — the frame is ornament, the buttons are buttons.',
};
