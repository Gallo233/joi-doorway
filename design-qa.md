# Gallo Portfolio Design QA

- Source visual truth: `/Users/liujialuo/Downloads/已生成图像 3 (1).png`
- Implementation URL: `http://127.0.0.1:4178/`
- Desktop implementation screenshot: `/Users/liujialuo/Documents/All Joi/docs/design-references/gallo-home-reference-ratio.png`
- Mobile implementation screenshot: `/Users/liujialuo/Documents/All Joi/docs/design-references/gallo-home-mobile-final.png`
- Project implementation screenshot: `/Users/liujialuo/Documents/All Joi/docs/design-references/gallo-joi-desktop.png`
- Side-by-side comparison evidence: `/Users/liujialuo/Documents/All Joi/docs/design-references/gallo-hero-comparison.png`
- Desktop comparison viewport: 957 × 681, matching the 1487 × 1058 source aspect ratio
- Mobile verification viewport: 390 × 844
- State: English desktop hero, English and Chinese mobile hero, Work section, Joi project route

## Findings

No actionable P0, P1, or P2 findings remain.

- Fonts and typography: the desktop hero keeps the supplied source typography exactly because the selected brief is rendered as the hero artwork. Supporting sections use a restrained Helvetica/system grotesk with a system mono companion; hierarchy and wrapping remain readable at desktop and mobile sizes.
- Spacing and layout rhythm: the desktop hero matches the source frame and crop. Supporting sections use consistent 24px desktop gutters, 18px mobile gutters, editorial section gaps, and square image surfaces rather than generic rounded cards.
- Colors and visual tokens: the implementation preserves the brief's white, cool blue, coral, muted green, and black palette. The dark Thoughts section is an intentional independent extension of the supplied direction.
- Image quality and asset fidelity: the hero uses the supplied 1487 × 1058 artwork without replacement or reconstruction. All supporting visuals are supplied Joi, personal portrait, and photography assets. No CSS illustrations, placeholder imagery, custom SVGs, or emoji substitutes are present.
- Copy and content: Joi and Joi Map descriptions are grounded in the current GitHub repositories and the supplied résumé. English/Chinese switching works on the main narrative sections.
- Icons: no additional interface icons were required; the map pin and decorative marks remain part of the supplied hero artwork.
- Accessibility: navigation and project hotspots are keyboard reachable, images have descriptive alt text, reduced-motion preferences are respected, and the mobile page has no horizontal overflow.

## Focused Region Comparison

No separate focused crop was required for the desktop hero because the entire visible hero is one supplied raster asset and the side-by-side comparison shows all typography, character art, terrain, navigation labels, and project markers at a readable scale. The mobile adaptation was reviewed separately because no mobile source mock was supplied.

## Comparison History

### Pass 1 — blocked

- [P2] Mobile hero framing hid Joi and exposed oversized fragments of the desktop headline.
  - Fix: changed the mobile hero artwork from a 230% wide element to a true cover crop and moved the focal point toward Joi.
- [P2] Two mobile navigation layers overlapped at the top of the hero.
  - Fix: removed the duplicate in-hero navigation and kept one persistent responsive header.
- [P2] Project metadata on the Joi detail page wrapped into an excessively narrow column.
  - Fix: reduced the metadata label track and gap so the question remains readable.

### Pass 2 — blocked

- [P2] Joi's face was still mostly hidden behind the mobile title panel.
  - Fix: narrowed the title panel, reduced the mobile display size, and shifted the composition so Joi remains visible beside the copy.

### Pass 3 — passed

- Desktop side-by-side evidence shows the hero composition matches the selected brief.
- Mobile English and Chinese states remain readable at 390 × 844 with no horizontal overflow.
- Work and project-detail layouts are legible and visually consistent.
- Navigation, language switching, internal project routes, résumé link, and GitHub links are present.
- Browser console check returned no warnings or errors on the homepage and Joi project page.

## Primary Interactions Tested

- Desktop hero project and section hotspots are present and keyboard reachable.
- English-to-Chinese language switching updates the hero and section copy.
- `/joi/` and `/joi-map/` are statically generated project routes.
- GitHub and résumé links resolve to their intended destinations.
- Mobile page width is 390px with a measured 390px document scroll width.

## Follow-up Polish

- [P3] A future pass could replace the supporting system grotesk with a locally hosted display family for even more distinctive typography below the supplied hero.

final result: passed
