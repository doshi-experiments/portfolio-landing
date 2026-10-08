# Recreation checks

Checked locally in Chromium on October 8, 2026, against the public Framer reference.

- All seven routes load directly at 320, 390, 768 and 1440 pixels wide, with no horizontal overflow, missing images, failed resources or JavaScript errors.
- Internal page links and section anchors resolve. The archive opens its local case study in a new tab, and reveals its description through keyboard navigation.
- All six About questions open and close with the keyboard. The dog animation has a pause control and a static fallback; reduced motion stops the animation and tool carousel.
- The introduction's typing cycle keeps the adjacent links in place at all four screen widths and switches to static text when reduced motion is requested.
- The shipment walkthrough selects its six annotated screens; the small-screen and no-JavaScript layouts retain all screen images.
- The travel-claims prototype video plays locally with native controls. The rural-healthcare gallery supports buttons and arrow keys, with correct first/last-slide states.
- HTML IDs are unique, local file references exist, and all individual assets are below 25 MiB.

The project content and original artwork come from the public portfolio. Healthcare remains an overview because the original page says the full study is forthcoming. The three external Squarespace projects and the résumé PDF retain their existing external destinations. This branch has not been deployed.
