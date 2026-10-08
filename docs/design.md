# Framer portfolio recreation

Reference: https://orange-pentagon-065454.framer.app/

This branch recreates the public portfolio as a small static site, using its real imagery and content. It is independent of the shared app design system. The Bauhaus experiment remains in the original checkout.

## Tokens

- Canvas: #000000
- Paper: #FFFFFF
- Reading text: #CCCCCC
- Coral: #FF5E7C
- Archive label: #D2F944
- Quiet border: #303030

Playfair Display carries the introduction and project titles. Poppins carries navigation, descriptions, labels and case-study copy. Amiko supports the Devanagari wordmark. Body copy stays below 75 characters per line; the larger serif introduction has room to wrap naturally.

## Layout study

The reference pairs a left-aligned introduction with a circular portrait. A full-height opening gives way to alternating case studies, then a three-column archive. On phones, the portrait precedes the introduction, projects stack image-first, and archive descriptions are always visible.

```text
ऋषभ                                            About  Work

Hi I'm Rishabh and I                  (illustrated portrait)
design experiences.
About | See my work

[Truck illustration]       Truck & Driver Management
                           Description / skills / case study

GenAI Travel Claims                    [Travel illustration]
Description / skills / case study

[Healthcare illustration]  Healthcare and Benefits
                           Description / skills / overview

From the archives
[Wells Fargo]  [Meld]  [Theia]
[This & That]  [Rural healthcare]
```

A centered hero with uniform project cards was considered and rejected: it loses the reference's portrait/introduction balance and makes the work less distinct. The chosen layout retains the illustrated projects as the main visual event. Existing archive hover behavior also works on keyboard focus; touch users see the information immediately. The typing introduction respects reduced motion. No decorative entrance animations are added.

## Scope

Rebuild the homepage, About, and reachable internal project pages with local assets and ordinary browser navigation. Existing external archive links retain their destinations and announce a new tab. Do not copy the Framer runtime, trackers or editor metadata.
