# Project Detail Route Specification

## Overview

- Target files: `app/[slug]/page.tsx`, `components/projectData.ts`, `styles.css`
- Source references:
  - `docs/design-references/haoqi.design/routes/reunimos-0.png`
  - `docs/design-references/haoqi.design/routes/wasm_design_utils-0.png`
  - `docs/design-references/haoqi.design/routes/teambition-direct.png`
- Interaction model: static article route with sticky table-of-contents chips and fixed HUD.

## DOM Structure

- `.project-page`
  - `.project-detail-hud`
  - `.project-article`
    - `.project-kind`
    - `h1`
    - `.project-date-row`
    - `.project-summary`
    - `.project-figure-grid`
    - `.project-metadata`
    - `.project-toc`
    - repeated `.project-copy-section`
  - `.project-footer-hud`

## Content Mapping

- `/joi` replaces source `/reunimos` short product article.
- `/joi-map` replaces visual/product guide route.
- `/doorway` replaces source case-study style route for the interactive site entrance.
- `/autopilot` and `/quant-ai` replace tool/technical project routes.
- `/sitianjian` replaces the unfinished/story-style route.

## Visual Translation

- Source detail pages are mostly dark; clone keeps light All Joi palette.
- Fixed HUD and bottom coordinate metadata are preserved.
- Large title/date/year rhythm is preserved.
- Metadata card, code blocks, inline monospaced surfaces, and image grids are preserved as route patterns.

## Responsive Behavior

- Desktop: centered 960px article column, two-column figure grid, three-column metadata.
- Mobile: single-column article, single-column figures/metadata, top HUD keeps only essential links.
