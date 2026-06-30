# Joi Doorway

Joi Doorway is an interactive personal-site entrance for the Joi ecosystem.

The page opens with a first-person Joi Map moment, moves toward a warm apartment door, lets the visitor drag open the peephole, shows Joi Map close to the lens, and then transitions into the All Joi studio homepage.

## What Is Included

- `index.html` - static entry page and All Joi studio homepage.
- `styles.css` - visual system, responsive layout, door/peephole transitions, project cards.
- `script.js` - intro state machine, drag/wheel interaction, video fallback handling, reveal effects.
- `assets/` - production images and rendered MP4 assets used by the page.
- `joi-doorway-video/` - Remotion source project for regenerating the intro videos.
- `GEMINI.md` - front-end context and design constraints for AI-assisted iteration.

## Run Locally

The site is static. You can open `index.html` directly, or run a tiny local server:

```bash
python3 -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

Useful URL flags:

- `?skipIntro=1` jumps directly to the All Joi studio homepage.

## Video Assets

The webpage uses two rendered videos:

- `assets/intro-phone.mp4` - vertical Joi Map phone-screen animation.
- `assets/peephole-joi.mp4` - square peephole close-up of Joi Map.

The Remotion source lives in `joi-doorway-video/`.

```bash
cd joi-doorway-video
npm i
npm run lint
npm run render:intro
npm run render:peephole
npm run render:preview
```

Notes:

- `render:intro` and `render:peephole` write directly into `../assets/`.
- `render:preview` writes a full storyboard preview to `joi-doorway-video/out/`.
- `out/` and `node_modules/` are intentionally ignored by Git.

## Character Rules

- Joi App and Joi Map are the same person in different contexts.
- Joi App: amber eyes, colorful hairpins, desktop companion outfit, no side braid.
- Joi Map: amber eyes, colorful hairpins, side braid with coral ribbon as the Map-only marker.
- The tone should feel like a real partner: sunny, playful, warm, and a little jumpy.
- Avoid sci-fi styling, heavy UI exposition, sexualization, overly childish proportions, and subtitle overlays inside the videos.

## Validation

Current checks used:

```bash
node --check script.js
cd joi-doorway-video && npm run lint
```

The page was also browser-tested with the rendered MP4 files loaded and the intro flow completed.
