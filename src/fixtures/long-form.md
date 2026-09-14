---
title: Twelve ways to set the same page
summary: A development fixture for long-form reading. Not published. The text adapts the project brief's movement definitions so every direction can be checked against real paragraphs, lists, a table, a figure and code, at every reading size.
---

## Why one page, twelve times

A design movement is not a colour palette. It is a set of decisions about composition, hierarchy, interval, geometry, ornament and surface — and the point of this portfolio is that all twelve of those decision sets can hold the same content without losing it. This fixture exists to check the part that is easiest to get wrong: long stretches of reading.

The brief asks for a reading measure of roughly sixty to seventy characters, a body size of eighteen pixels, and a line height between 1.55 and 1.7. Every direction may move the margins, the rules and the ornament around that column; none may narrow it into a ribbon or hide a paragraph behind a reveal.

### What to look for

- The measure holds at 100, 112.5 and 125 per cent reading size.
- Headings keep their scale relationship to the body; nothing becomes a slogan.
- Lists, tables and code keep real structure and stay left-aligned.
- Ornament stays in the margins. Nothing patterned sits behind a sentence.
- Links are distinguishable without colour, and the focus ring survives every background.

## The twelve, briefly

Arts and Crafts emerged in late nineteenth-century Britain as an argument for skilled making and honest materials against industrial production. Art Nouveau, flourishing from the 1890s to the First World War, looked for a new decorative language in organic form and the energetic whiplash line. Art Deco gathered diverse decorative influences in the 1920s and 1930s into geometric confidence, craft and the imagery of modern life.

De Stijl formed around a Dutch journal founded in 1917 and explored abstract relationships among line, plane and colour. The Bauhaus, a German school between 1919 and 1933, brought artistic education, craft and industrial production into one workshop. Constructivism came out of the Russian avant-garde and tied constructed form to hopes for social transformation — its context is political, not merely graphic.

> Dates below are approximate periods of emergence or prominence, not mutually exclusive boundaries. No movement simply replaced another, and this selection is not a complete global history.

The Swiss International Typographic Style is a mid-century graphic tradition of systematic grids and clear hierarchy. Brutalism is principally architectural: conspicuous structure and material directness. Minimalism, in 1960s America, reduced form to repeated modules and proportion. Pop Art drew on commercial culture and reproduction. Op Art explored how geometric pattern and colour affect perception. Memphis, a 1980s collective around Ettore Sottsass, set bright colour, unexpected form and bold pattern against restrained function.

| Movement | Period (approx.) | Carries the page through |
| --- | --- | --- |
| Arts and Crafts | 1880s–1910s | editorial rhythm, repeated borders |
| Art Nouveau | 1890–1910 | the flowing line, asymmetry |
| Art Deco | 1920s–1930s | symmetry, stepped bands |
| De Stijl | 1917–1930s | orthogonal planes, structural rules |
| Bauhaus | 1919–1933 | purposeful geometry, scale |
| Constructivism | 1917–1930s | directional tension, condensed type |
| Swiss | 1950s–1960s | the grid, one rule weight |
| Brutalism | 1950s–1970s | mass, exposed structure |
| Minimalism | 1960s | repetition, interval |
| Pop Art | 1950s–1960s | print hierarchy, panels |
| Op Art | 1960s | one bounded optical study |
| Memphis | 1981–1988 | juxtaposed pattern and shape |

## A figure and a caption

<figure>
  <div class="fixture-swatch" aria-hidden="true"></div>
  <figcaption>A placeholder plate. In every direction the plate is framed by the recipe, and the caption is set in the UI face at the metadata size.</figcaption>
</figure>

### Numbered steps survive too

1. Read the statement; it should be the loudest thing on the page and still a sentence.
2. Find the first project without scrolling past a screen of ornament.
3. Open the style explorer, switch, and confirm you are still where you were.
4. Turn on Reduce effects and confirm the page settles at once.

## Code keeps its shape

Tokens are custom properties; recipes are finite enums. A direction file selects behaviour that already exists in CSS — it does not contain CSS.

```ts
recipe: {
  hero: 'grid-8-4',
  project: 'open-grid',
  sectionHeading: 'margin-number',
  frame: 'hairline',
  ornament: 'none',
}
```

Inline code such as `--layout-reading-measure` should read at the body size, in the mono face where the direction has one and a system monospace where it does not.

## One last paragraph

If a direction has made this page harder to read than the Swiss default, it has failed the brief regardless of how recognisable its hero is. The recognisable test and the readable test are both required; neither substitutes for the other.
