# Joi Doorway

Joi Doorway is a static, embeddable entrance page for the All Joi personal-site ecosystem.

The current version uses a generated first-person doorway video, freezes cleanly on the final door-handle frame, then turns that exact frame into a drag-down QTE. Pulling the handle opens the All Joi studio homepage.

## What Is Included

- `index.html` - static entry page, QTE layer, and All Joi studio homepage.
- `styles.css` - cinematic video/QTE styling, responsive grid, and high-interaction visual system.
- `script.js` - video-to-QTE state control, drag gesture handling, reveal effects, pointer HUD, and original WebGL shader background.
- `assets/doorway-qte-intro.mp4` - generated 10 second doorway video supplied for the current entrance.
- `assets/door-handle-final-frame.png` - extracted final frame used as the seamless QTE freeze frame.
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
videoIntro -> qteLocked -> qteDragging -> doorOpen -> home
```

Key behavior:

- `assets/doorway-qte-intro.mp4` autoplays muted for reliability.
- When the video ends, `assets/door-handle-final-frame.png` appears immediately above it.
- The visitor presses the door handle and drags downward.
- A short, decisive downward pull completes the QTE and transitions into the homepage.
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

- Desktop QTE: video ends on the handle frame, drag-down opens the homepage.
- Mobile QTE: handle hotspot aligns with the final video frame and drag-down opens the homepage.
- `?skipIntro=1`: enters the homepage directly.
- Browser console: no warnings or errors observed during validation.
