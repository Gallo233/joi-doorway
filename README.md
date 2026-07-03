# Joi Doorway

Joi Doorway is a static, embeddable entrance page for the All Joi personal-site ecosystem.

The current version begins on an iPhone home screen. The visitor taps Joi Map, sees the map interface open, hears three knocks, then the camera turns toward the door and stops at an interactive peephole. Swiping/dragging upward opens the peephole and hands off to the generated first-person doorway video. After the video reaches its final door-handle frame, dragging downward rotates a pixel cutout taken from that same frame before opening the All Joi studio homepage.

## What Is Included

- `index.html` - static entry page, phone intro, door approach, pixel-handle layer, and All Joi studio homepage.
- `styles.css` - iPhone/map intro, cinematic video/pixel-handle styling, responsive grid, and high-interaction visual system.
- `script.js` - phone-to-peephole state control, knock audio, video-to-handle state control, pixel layer alignment, drag gesture handling, reveal effects, pointer HUD, and original WebGL shader background.
- `three-title.js` - local Three.js scene for the glossy soft-tube "all joi" homepage wordmark.
- `assets/iphone-home-joi-map.png` - temporary iPhone home visual with Joi Map app icon.
- `assets/iphone-home-joi-map@2x.png` - deterministic 2x upscale of the same screenshot for sharper Retina display.
- `assets/joi-map-main-ui.png` - temporary Joi Map main-interface visual.
- `assets/joi-map-main-ui@2x.png` - deterministic 2x upscale of the same screenshot for sharper Retina display.
- `assets/doorway-bg.png` - warm door approach visual used between the phone intro and peephole video.
- `assets/doorway-qte-intro.mp4` - generated 10 second doorway video supplied for the current entrance.
- `assets/door-handle-final-frame.png` - extracted final frame used as the video reference.
- `assets/door-handle-clean-frame.png` - final frame with the static lever softened/covered for the interactive moment.
- `assets/door-handle-lever-sprite.png` - transparent pixel cutout of the original video handle lever.
- `assets/three.module.js` - vendored Three.js runtime used by the homepage wordmark, avoiding a CDN dependency.
- `assets/stickers/` - transparent glossy sticker assets used by the homepage floating visual layer.
- `assets/project-thumbs/` - generated raster thumbnails for Autopilot, quant-ai, and 司天监夜话 project cards.
- `assets/joi-app-v3.png` - Joi App visual reference, amber eyes, no side braid.
- `assets/joi-map-v3.png` - Joi Map visual reference, amber eyes, side braid.
- `joi-doorway-video/` - older Remotion source project kept for future rendered asset experiments.
- `GEMINI.md` - front-end context and constraints for AI-assisted iteration.
- `design-qa.md` - visual QA notes and screenshot evidence for the current homepage pass.

## Run Locally

The site is static. You can open `index.html` directly, or run a tiny local server:

```bash
python3 -m http.server 4177
```

Then open:

```text
http://localhost:4177
```

Useful URL flags:

- `?skipIntro=1` jumps directly to the All Joi studio homepage.

## Current Interaction

The active state flow is:

```text
phoneHome -> mapOpening -> mapHome -> knocking -> doorTurn -> peepholeApproach -> peepholeLocked -> peepholeDragging -> peepholeOpening -> videoIntro -> qteLocked -> qteDragging -> doorOpen -> home
```

Key behavior:

- The visitor starts on an iPhone screen and clicks the Joi Map app icon.
- The simulator toolbar region in the temporary iPhone screenshots is cropped out in CSS.
- Joi Map opens into the temporary main-interface visual using an iOS-style icon-to-app expansion mask.
- The page plays three synthesized knock sounds through Web Audio after the user gesture.
- The intro timing is compacted to reach the peephole in about 4.3 seconds while keeping each state readable.
- The camera turns to the door and pushes into the peephole.
- The peephole uses layered CSS metal, glass, highlight, and shutter surfaces, then waits for upward drag/touch swipe or mouse-wheel up before opening.
- `assets/doorway-qte-intro.mp4` starts only after the peephole interaction completes.
- When the video ends, `assets/door-handle-final-frame.png` appears immediately above it.
- A transparent sprite cut from the original video frame covers the static handle.
- The visitor presses the handle and drags downward.
- The original video handle pixels rotate around the source-frame pivot, then transition into the homepage once pulled far enough.
- The homepage first screen, not the entrance sequence, replaces the old `JOI DOORWAY` title with a large glossy soft-tube "all joi" Three.js wordmark.
- The wordmark is built from Three.js tube geometry with rounded caps, directional/rim/glint lighting, glossy physical materials, and pointer-driven floating/tilt motion.
- The homepage keeps the light All Joi tone while borrowing the reference site's mechanisms: fixed HUD, grid/crosshair layer, floating stickers, large foreground typography, real project thumbnails, sticky scroll beats, and project-card hover states.

## GitHub Project Content

The homepage project cards are based on the current GitHub READMEs from the `Gallo233` account:

- `Joi` - Windows-first multimodal desktop companion with planner, policy gate, memory, tool registry, screen watching, Codex/browser/game/MCP adapters, and character-fronted shell.
- `aiguide-ios` - SwiftUI on-site AI guide MVP with MapKit, location, nearby recommendations, narration, photo recognition, itinerary/search, settings, localization, and voice/map-style paths.
- `joi-doorway` - this interactive entrance and personal-site surface.
- `joi-autopilot-control-center` - local Codex control center for design-to-develop-to-test-to-review loops with user approval at the commit boundary.
- `quant-ai` - AI quant assistant covering market data, indicators, LLM commentary, strategy generation, and backtesting.
- `sitianjian` - Godot/Dialogic bilingual visual novel experiment around ancient-China time messages and story-world building.

## Design Direction

The homepage references the interaction density and visual confidence of `haoqi.design` without copying its source, assets, or shaders. Public inspection showed a canvas/WebGL-heavy Next.js site with dense typography, fixed HUD, pointer/time metadata, and scroll-driven content. Joi Doorway translates that into an original warm, non-sci-fi Joi ecosystem studio.

Visual tone:

- Warm personal studio, not spaceship/dashboard.
- High-interaction, but still soft and human.
- Cream, ink, amber, coral, aqua, and muted green accents.
- Large editorial typography paired with character-system cards.
- No subtitles over the generated video.

## Character Rules

- Joi App and Joi Map are the same person in different contexts.
- Joi App: amber eyes, colorful hairpins, desktop companion outfit, no side braid.
- Joi Map: amber eyes, colorful hairpins, side braid with coral ribbon as the Map-only marker.
- The tone should feel like a real partner: sunny, playful, warm, and a little jumpy.
- Avoid sci-fi styling, heavy UI exposition, sexualization, overly childish proportions, and generic portfolio-template composition.

## Validation

Current checks used:

```bash
node --check script.js
node --check three-title.js
git diff --check
```

Browser-tested locally:

- Desktop phone intro: clicking the Joi Map icon opens the app visual, enters the knock/door approach, and stops at the peephole lock with no console errors.
- Retina asset path: browser selects `@2x` screenshots when device pixel ratio asks for sharper sources.
- Desktop peephole: the camera stops at `peepholeLocked`; upward drag opens it and starts the video.
- Mobile phone intro and peephole: the icon and peephole hit targets remain aligned, no horizontal overflow appears, and upward drag reaches the video stage.
- Desktop pixel handle: video ends on the handle frame, the source-frame handle cutout aligns and drag-down opens the homepage.
- Mobile pixel handle: handle layer aligns with the cropped final video frame and drag-down opens the homepage.
- `?skipIntro=1`: enters the homepage directly.
- Homepage first screen: the large "all joi" Three.js wordmark loads locally, uses soft tube geometry, responds to pointer movement, includes floating sticker assets, and the layout has no horizontal overflow on desktop or mobile.
- Homepage sticky process section: sticks to the viewport on desktop and mobile, with mobile typography adjusted to avoid clipping.
- Browser console: no warnings or errors observed during validation.
