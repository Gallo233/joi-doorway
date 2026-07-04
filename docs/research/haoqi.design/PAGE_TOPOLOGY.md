# haoqi.design Full-Site Page Topology

## Layers

- Fixed HUD: top nav and bottom metadata.
- Fixed difference grid: viewport-sized visual grid/crosshair layer.
- Fixed WebGL/canvas atmosphere: background and soft 3D word/objects.
- Internal source scroll container: full height, hidden native scrollbar.
- Flow content: hero, statement, selected work, inverted speed interlude, principle statements, sticky word section, footer.
- Project detail routes: fixed HUD plus centered article/case-study body.

## Sections

1. Hero
   - Interaction model: time and pointer-driven visual layer, normal scroll.
   - Layout: 12-column grid, top metadata row, lower-left oversized headline.
   - Assets: stickers, WebGL/canvas soft 3D word.

2. Statement
   - Interaction model: static plus scroll entry.
   - Layout: left decorative sign, right large paragraphs.

3. Selected Work Grid
   - Interaction model: hover/click cards.
   - Layout: asymmetric 12-column masonry/staggered grid across multiple viewport heights.
   - Assets: card media surfaces.

4. Inverted Speed Interlude
   - Interaction model: scroll-driven sticky full-screen scene.
   - Layout: dark/inverted grid, radial speed lines, large centered editorial text.
   - All Joi translation: "Build with a human touch" with a short dark contrast segment inside an otherwise light site.

5. Principle Statements
   - Interaction model: scroll-driven static/sticky feeling.
   - Layout: short statement fragments positioned around central orbit/ring marks.

6. Sticky Word
   - Interaction model: scroll-driven sticky.
   - Layout: full viewport sticky text.

7. Footer
   - Interaction model: links/hover.
   - Layout: large editorial call to action with bottom contact row and soft 3D word backdrop.

## Detail Route Topology

All source detail routes share a family resemblance:

1. Fixed HUD with brand, work/contact/theme links.
2. Centered content column.
3. Large title, date, year row, and body summary.
4. Optional media blocks, code blocks, or image grids.
5. Metadata card with last-updated, dimensions, character count, and links.
6. Bottom coordinate HUD.

All Joi implementation uses a single dynamic Next.js route, `app/[slug]/page.tsx`, backed by `components/projectData.ts`.

## All Joi Translation

- Keep intro doorway outside this topology.
- Apply this topology only to the home state after the doorway.
- Keep All Joi project content, but use source-style hierarchy and motion.
- Preserve the user's requested light All Joi temperament even where the source route template is dark.
