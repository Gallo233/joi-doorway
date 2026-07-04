# Home Hero Specification

## Overview

- Target surface: All Joi homepage first viewport.
- Reference screenshot: `docs/design-references/haoqi.design/desktop-after-wait.png`.
- Interaction model: pointer/time-driven 3D atmosphere plus normal scroll.

## Required Structure

- Top fixed HUD remains above all content.
- Hero intro row stays at top of viewport.
- 3D `all joi` lives behind foreground typography.
- Foreground headline anchors bottom-left and never clips.
- Stickers float above background but below HUD/critical text.

## Computed Values From Source

- Background: `rgb(251, 250, 244)` with pale blue visual atmosphere.
- Primary text: `rgb(0, 0, 0)`.
- Secondary text: `rgba(54, 54, 48, 0.6)`.
- Highlight: `#c0fe04`.
- Hero display text: uppercase, bold, about `6svw`, line-height `1`.
- Page gutters desktop: about `56px`; mobile: about `16px`.
- HUD font: mono uppercase, 12-16px.

## All Joi Adjustments

- Headline copy can remain All Joi-specific, but should read like the source: bold black foreground.
- 3D word color should be pale blue/ice with low alpha and glossy highlights.
- Avoid purple, high-saturation toy material, and foreground text collisions.
- On mobile, stack hero metadata and keep headline fully inside viewport width.
