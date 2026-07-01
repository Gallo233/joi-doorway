# Joi Doorway

Joi Doorway is a static, embeddable entrance page for the All Joi personal-site ecosystem.

The current version begins on an iPhone home screen. The visitor taps Joi Map, sees the map interface open, hears three knocks, then the camera turns toward the door and pushes into the peephole sequence. After the generated first-person doorway video reaches its final door-handle frame, dragging downward rotates a pixel cutout taken from that same frame before opening the All Joi studio homepage.

## What Is Included

- `index.html` - static entry page, phone intro, door approach, pixel-handle layer, and All Joi studio homepage.
- `styles.css` - iPhone/map intro, cinematic video/pixel-handle styling, responsive grid, and high-interaction visual system.
- `script.js` - phone-to-peephole state control, knock audio, video-to-handle state control, pixel layer alignment, drag gesture handling, reveal effects, pointer HUD, and original WebGL shader background.
- `assets/iphone-home-joi-map.png` - temporary iPhone home visual with Joi Map app icon.
- `assets/joi-map-main-ui.png` - temporary Joi Map main-interface visual.
- `assets/doorway-bg.png` - warm door approach visual used between the phone intro and peephole video.
- `assets/doorway-qte-intro.mp4` - generated 10 second doorway video supplied for the current entrance.
- `assets/door-handle-final-frame.png` - extracted final frame used as the video reference.
- `assets/door-handle-clean-frame.png` - final frame with the static lever softened/covered for the interactive moment.
- `assets/door-handle-lever-sprite.png` - transparent pixel cutout of the original video handle lever.
- `assets/joi-app-v3.png` - Joi App visual reference, amber eyes, no side braid.
- `assets/joi-map-v3.png` - Joi Map visual reference, amber eyes, side braid.
- `joi-doorway-video/` - older Remotion source project kept for future rendered asset experiments.
- `GEMINI.md` - front-end context and constraints for AI-assisted iteration.

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
phoneHome -> mapOpening -> mapHome -> knocking -> doorTurn -> peepholeApproach -> videoIntro -> qteLocked -> qteDragging -> doorOpen -> home
```

Key behavior:

- The visitor starts on an iPhone screen and clicks the Joi Map app icon.
- Joi Map opens into the temporary main-interface visual.
- The page plays three synthesized knock sounds through Web Audio after the user gesture.
- The camera turns to the door, pushes into the peephole, and hands off to `assets/doorway-qte-intro.mp4`.
- `assets/doorway-qte-intro.mp4` starts only after the phone-to-door sequence completes.
- When the video ends, `assets/door-handle-final-frame.png` appears immediately above it.
- A transparent sprite cut from the original video frame covers the static handle.
- The visitor presses the handle and drags downward.
- The original video handle pixels rotate around the source-frame pivot, then transition into the homepage once pulled far enough.
- The homepage uses an original WebGL shader canvas, pointer coordinates, time HUD, scroll reveals, and project-card hover states.

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
```

Browser-tested locally:

- Desktop phone intro: clicking the Joi Map icon opens the app visual, enters the knock/door approach, and starts the peephole video with no console errors.
- Mobile phone intro: the icon hit target remains aligned, no horizontal overflow appears, and the flow reaches the video stage.
- Desktop pixel handle: video ends on the handle frame, the source-frame handle cutout aligns and drag-down opens the homepage.
- Mobile pixel handle: handle layer aligns with the cropped final video frame and drag-down opens the homepage.
- `?skipIntro=1`: enters the homepage directly.
- Browser console: no warnings or errors observed during validation.
