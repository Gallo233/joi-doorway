# haoqi.design Full-Site Behavior Notes

Target: `https://haoqi.design`

## Stack Evidence

- Next.js on Vercel.
- Response header includes `x-powered-by: Next.js`.
- Page loads `/_next/static/...` chunks and React Server Components payload.

## Visual Mechanisms

- Light theme base: `rgb(251, 250, 244)`.
- Primary text: pure black.
- Secondary text: `rgba(54, 54, 48, 0.6)`.
- Hairline/grid: low alpha dark lines.
- Selection/highlight: neon yellow green `#c0fe04`.
- Fixed HUD sits above the page at z-index 50.
- Bottom metadata HUD remains fixed.
- A full-viewport SVG/canvas grid uses `mix-blend-difference`.
- Page itself scrolls inside an internal full-screen `overflow-y-auto` container, not natural body scroll.
- Hero has small top metadata blocks, huge lower-left editorial typography, and a pale glossy 3D/canvas word behind the text.
- Stickers are visual texture, not primary CTA controls.
- Work cards use asymmetric 12-column placement and square media boxes with small neon labels.
- The work section is a long staggered grid, not a compact portfolio row.
- A dark/inverted speed-line interlude appears after work and uses full-screen sticky framing.
- The final contact/CTA returns to large soft 3D word energy and fixed HUD metadata.

## Internal Routes

The root page links to these internal routes:

- `/reunimos`
- `/inspire_mono`
- `/wasm_design_utils`
- `/adrive`
- `/shore_icon`
- `/teambition`

Route extraction artifacts are saved in:

- `docs/research/haoqi.design/full-site-route-summary.json`
- `docs/research/haoqi.design/routes/*.json`
- `docs/design-references/haoqi.design/routes/*.png`

Observed route templates:

- Short project article: centered title/date/year/body plus metadata card.
- Long technical article: title/date/year, table-of-contents anchors, code blocks, inline code chips.
- Visual case-study page: large image grids and captions.
- Unfinished project page: short body plus metadata card.

## Typography

- Sans: `tiktok, sans-serif` in the source. Use a local system fallback with condensed width/weight instead of copying private font files.
- Mono: `tronica-mono, monospace` in the source. Use `ui-monospace`/`SFMono-Regular` fallback locally.
- Hero display: uppercase, very bold, line-height `1`, width-expanded feel.
- HUD: mono uppercase, 12-16px.

## Implementation Translation For All Joi

- Keep the light All Joi mood, but move closer to source palette: soft blue-white atmosphere with black type and neon-green accent tags.
- Treat the 3D `all joi` as translucent environmental geometry behind the hero text, not as the foreground headline.
- Remove the purple glossy toy-like color.
- Prevent clipping by anchoring foreground hero type to the same left inset as the HUD/grid.
- Keep Joi project content and current entrance sequence.
- Use natural body scroll in the clone for integration with the doorway intro, but preserve the fixed HUD, viewport grid, sticky sections, and long-scroll rhythm.
- Map source project routes to All Joi routes: `/joi`, `/joi-map`, `/doorway`, `/autopilot`, `/quant-ai`, `/sitianjian`.
- Replace source case-study content with Joi ecosystem summaries, local assets, and GitHub repository links.
