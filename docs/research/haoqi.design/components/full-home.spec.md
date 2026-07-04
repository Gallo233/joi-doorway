# Full Home Specification

## Overview

- Target files: `index.html`, `components/legacyMarkup.ts`, `styles.css`
- Screenshots:
  - Source timeline: `docs/design-references/haoqi.design/home-timeline/*.png`
  - Clone hero: `docs/design-references/all-joi-fullsite-home-hero.png`
  - Clone speed segment: `docs/design-references/all-joi-fullsite-speed.png`
- Interaction model: natural scroll, sticky full-screen sections, hover/focus project cards, pointer-driven HUD/Three.js word.

## DOM Structure

- `.site-home.portfolio-home`
  - fixed HUD, pointer HUD, bottom HUD
  - `.source-hero`
  - `.statement-section`
  - `.work-section`
  - `.speed-section`
  - `.principle-section`
  - `.sticky-words`
  - `.process-section`
  - `.site-footer.terminal-footer`

## Visual Translation

- The source uses a dark/pale mode mix; the clone keeps All Joi light blue/cream as the base.
- The source hero's soft 3D `hello` becomes pale `all joi` Three.js tube geometry.
- The source work grid becomes All Joi project cards linking to internal routes.
- The source inverted starfield segment becomes `.speed-section`.
- The source footer soft 3D CTA becomes `.terminal-footer` with a translucent `all joi` backdrop.

## States & Behaviors

- Project cards: hover/focus/click toggles `.is-active`, updates Joi dialogue, and changes shader accent.
- Speed segment: sticky dark contrast scene; speed lines animate continuously with CSS keyframes.
- Reveal items: IntersectionObserver adds `.is-visible`.
- HUD: pointer and GMT+8 time update through `script.js`.

## Responsive Behavior

- Desktop: 12-column grid, fixed HUD, staggered project grid, sticky full-screen interludes.
- Mobile: single-column flow, hidden bottom HUD/pointer HUD, project cards stack, large hero copy remains inside viewport.
