/* The portfolio's content — the one thing every direction renders the same.
 *
 * Copy is the copy that shipped on the under-construction sheet (now archived
 * at /blueprint/) plus the three live experiments as the experiments index
 * describes them. Nothing here is invented; a project is listed only because
 * it is live. Adding a case study means filling `caseStudies`, nothing else. */

export const identity = {
  name: 'Rishabh Doshi',
  domain: 'rishabhdoshi.com',
  email: 'hello@rishabhdoshi.com',
  linkedin: 'https://www.linkedin.com/in/rishabhdoshi13/',
  github: 'https://github.com/doshi-experiments',
  experiments: 'https://experiments.rishabhdoshi.com',
} as const;

export const hero = {
  positioning:
    'Outside of work, I enjoy making and breaking things. I’m a hoarder of ' +
    'stories, experiences, and knowledge because I believe we are a reflection ' +
    'of our context.',
  invitation: 'Same work. Different design movements.',
} as const;

export const nav = [
  { id: 'work', label: 'Work', href: '#work' },
  { id: 'process', label: 'Process', href: '#process' },
  { id: 'contact', label: 'Contact', href: '#contact' },
  { id: 'experiments', label: 'Experiments', href: identity.experiments, external: true },
] as const;

export const actions = [
  { id: 'experiments', label: 'Enter the Experiments Wing', href: identity.experiments, primary: true, external: true },
  { id: 'email', label: 'Email', href: `mailto:${identity.email}` },
  { id: 'linkedin', label: 'LinkedIn', href: identity.linkedin, external: true },
  { id: 'github', label: 'GitHub', href: identity.github, external: true },
] as const;

export interface ProjectPart { name: string; url: string }
export interface Project {
  code: string;
  discipline: string;
  name: string;
  status: 'live' | 'wip' | 'planned';
  url: string;
  blurb: string;
  parts?: ProjectPart[];
}

/** In the order the experiments index lists them. */
export const projects: Project[] = [
  {
    code: 'E-01.1',
    discipline: 'Calculators',
    name: 'Rent vs Buy',
    status: 'live',
    url: 'https://rent-vs-buy.rishabhdoshi.com',
    blurb:
      'Thirty years of renting versus owning, side by side, on either Canadian or US ' +
      'rules — the compounding, the insurance and the tax all differ, so the toggle ' +
      'changes the arithmetic and not just the labels. Mortgage, maintenance, transfer ' +
      'tax, remodels, appreciation and the opportunity cost of a down payment sitting in ' +
      'a house instead of the market. Six tabs, including whether to prepay the mortgage ' +
      'or invest the money instead, two properties compared against one pot of cash, and ' +
      'an investment property with cap rate, DSCR and depreciation. Change one assumption ' +
      'and watch the crossover year move. Every input lives in the URL, so the version ' +
      'you are looking at is the version you can send someone.',
    parts: [
      { name: 'Rent vs. buy', url: 'https://rent-vs-buy.rishabhdoshi.com/' },
      { name: 'Appreciation', url: 'https://rent-vs-buy.rishabhdoshi.com/appreciation/' },
      { name: 'Payment comparison', url: 'https://rent-vs-buy.rishabhdoshi.com/payment-comparison/' },
      { name: 'Prepayment', url: 'https://rent-vs-buy.rishabhdoshi.com/prepayment/' },
      { name: 'Two properties', url: 'https://rent-vs-buy.rishabhdoshi.com/two-properties/' },
      { name: 'Investment property', url: 'https://rent-vs-buy.rishabhdoshi.com/investment-property/' },
    ],
  },
  {
    code: 'E-03.1',
    discipline: 'Visualizations',
    name: 'Visualizations',
    status: 'live',
    url: 'https://visualizations.rishabhdoshi.com',
    blurb:
      'Four exhibits on one sheet, each about a quantity that gets away from you. In the ' +
      'first, two balls bounce in a cage and every collision spawns a third. Collision rate ' +
      'goes as the square of the population, so the obvious prediction is that the count ' +
      'runs to infinity at a finite, calculable time — and it does not. The page measures ' +
      'the growth exponent rather than assuming it, and finds it below one: the balls share ' +
      'a fixed pot of energy so they slow as they multiply, and a newborn needs somewhere to ' +
      'go, which gets harder until it is impossible. Watching that intuition break is the ' +
      'exhibit. The second is a drawing surface with up to 24-fold symmetry, where each ' +
      'stroke is several fine strands that fan apart as you accelerate. The third starts a ' +
      'hundred and twenty double pendulums a billionth of a radian apart and fits the ' +
      'Lyapunov exponent live, which is the rate at which knowing the starting conditions ' +
      'stops being any help. The fourth hands you those pendulums as a brush: you drag the ' +
      'pivot and their lower bobs are the ink. A pivot being dragged is not an inertial ' +
      'frame, so it is your acceleration that swings them and not your speed — glide ' +
      'steadily and they barely stir, flick and they lash.',
    parts: [
      { name: 'Growth Cage', url: 'https://visualizations.rishabhdoshi.com/#growth' },
      { name: 'Silk', url: 'https://visualizations.rishabhdoshi.com/#silk' },
      { name: 'Divergence', url: 'https://visualizations.rishabhdoshi.com/#chaos' },
      { name: 'Harmonograph', url: 'https://visualizations.rishabhdoshi.com/#harmonograph' },
    ],
  },
  {
    code: 'E-04.1',
    discipline: 'Games',
    name: 'Mr. Shake',
    status: 'live',
    url: 'https://mr-shake.rishabhdoshi.com',
    blurb:
      'A social deduction party game for one phone and three to twenty people. Everyone ' +
      'gets the same word except the ones who don’t; describe it without saying it, and ' +
      'vote out the ones who are guessing. The interesting problem is not the rules, it is ' +
      'shared-screen secrecy: one device passed around a table, and no way for the next ' +
      'player to see the last one’s word, including through a fast double-tap or a ' +
      'mid-game reload. 176 hand-picked word pairs, works offline once installed.',
  },
];

export interface ProcessStep { number: string; title: string; paragraphs: string[] }

/** Verbatim from the sheet's three annotations — including the deliberate typo
 *  in the third, which the copy itself explains. Rendered as HTML strings so
 *  the wavy-underline mark survives. */
export const process: ProcessStep[] = [
  {
    number: '01',
    title: 'Empathize',
    paragraphs: [
      'My process starts and ends with empathy. What does empathy mean to me? It means ' +
        'understanding your stakeholders, their journeys, frustrations, and aspirations. ' +
        'Empathy is about the human in human-centered design. If there is a secret sauce ' +
        'to good experiences, this is it.',
    ],
  },
  {
    number: '02',
    title: 'Design',
    paragraphs: [
      'This is the easy part. Once you understand the user and what they’re doing, you ' +
        'just build. The project dictates the tools and this phase can be anything from ' +
        'hi-fidelity prototypes to thumbnail sketches on post-its. Agile is what I aim for here.',
    ],
  },
  {
    number: '03',
    title: 'Iterate',
    paragraphs: [
      'Nothing is <span class="typo">perfeet</span>. Nothing is perfect, at first. Good design ' +
        'takes iteration and testing, and lots of it. The important thing is to learn from ' +
        'one’s mistakes.',
      '(In case you’re wondering, the missing period is intentional. We are iterating)',
    ],
  },
];

export const closing = 'Nothing is perfect, at first.';

/** Reserved. A case study is a slug, a title, and prose sections; the theme
 *  engine needs nothing else to render one. Empty until there is one. */
export interface CaseStudy { slug: string; title: string; projectCode: string }
export const caseStudies: CaseStudy[] = [];
