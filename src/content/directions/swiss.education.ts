import type { Education } from '@design/schema';

export const education: Education = {
    context:
      'A graphic-design approach associated with mid-twentieth-century Switzerland: systematic grids, ' +
      'a clear typographic hierarchy, sans-serif type, asymmetric composition and plain visual ' +
      'communication. Josef Müller-Brockmann is the usual reference. It is one specific tradition ' +
      'inside the wider modernist context, not a synonym for modernism itself.',
    refs: [{ label: 'PRINT: Swiss style principles', url: 'https://www.printmag.com/featured/swiss-style-principles-typefaces-designers/' }],
    onThisPage: [
      'The opening statement spans eight of twelve columns; the introduction sits in the remaining four.',
      'Section numbers live in a margin column; headings and prose share the main grid.',
      'One rule weight, no boxes, no shadows. Red appears on the action and nowhere else.',
    ],
    interpretation:
      'Inter stands in for Helvetica and Akzidenz-Grotesk. The grid is CSS, not a printed page, and the ' +
      'hero drawing is a line plan of Max Bill’s Ulm campus — an analogy, since the style has no building of its own.',
};
