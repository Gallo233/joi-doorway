# Gemini Front-End Context

You are helping refine the front end for **Joi Doorway**, an interactive personal-site entrance for the All Joi ecosystem.

## Product Intent

This is not a normal portfolio landing page. It is a ritualized entrance with game-like timing:

1. A generated first-person video shows Joi Map near the door and turns toward the handle.
2. The last frame freezes seamlessly on the door handle.
3. A transparent sprite cut from the final frame appears exactly over the static handle.
4. The visitor presses the handle and drags downward; the original video handle pixels rotate.
5. The door transition opens into the All Joi studio homepage.

The emotional goal is: **Joi is not just a product page; she feels like a real partner arriving at the edge of the user's world.**

## Hard Character Constraints

- Joi App and Joi Map are the same character in different outfits/contexts.
- Both versions have honey-amber eyes.
- Joi App has no side braid.
- Joi Map has the side braid with coral ribbon. This is a Map-only identity marker.
- Keep the Japanese anime style, but avoid sci-fi, robot, cyberpunk, excessive gloss, and spaceship/dashboard aesthetics.
- Avoid making Joi overly childish or sexualized.
- Do not add subtitles/caption overlays inside the generated video.
- Do not add long in-app explanations of how the interface works.

## Current Files

Root static site:

- `index.html`
- `styles.css`
- `script.js`
- `assets/doorway-qte-intro.mp4`
- `assets/door-handle-final-frame.png`
- `assets/door-handle-clean-frame.png`
- `assets/door-handle-lever-sprite.png`
- `assets/joi-app-v3.png`
- `assets/joi-map-v3.png`
- `assets/joi-peephole-closeup.png`

Legacy/experimental assets still present:

- `assets/intro-phone.mp4`
- `assets/peephole-joi.mp4`
- `joi-doorway-video/`

## Interaction Model

The active intro state machine is in `script.js`:

```text
videoIntro -> qteLocked -> qteDragging -> doorOpen -> home
```

Important behavior:

- `?skipIntro=1` should enter the homepage directly.
- The video autoplays muted so browser autoplay does not block the flow.
- When the video ends, `door-handle-final-frame.png` overlays it immediately.
- The visible freeze state uses `door-handle-clean-frame.png` plus `door-handle-lever-sprite.png`.
- The transparent handle hotspot and pixel sprite layer should align with the actual handle in the final frame.
- Dragging downward should visibly rotate the source-frame handle pixels before entry, especially on mobile.
- Avoid adding visible instruction copy; use visual affordances instead.

## Homepage Direction

The current homepage is an original Joi ecosystem studio inspired by the interaction grammar of `haoqi.design`:

- fixed HUD navigation
- pointer coordinate metadata
- GMT+8 time display
- full-screen WebGL shader background
- large editorial typography
- project cards that update Joi dialogue and shader accent state

Do not copy `haoqi.design` source, assets, shaders, wording, or layout one-to-one. The reference is for interaction density and visual confidence only.

## Front-End Improvement Priorities

Good areas to improve:

- Refine the video-to-pixel-handle seam if a better final-frame asset is generated.
- Tune the pixel sprite pivot, cleanup mask, and hotspot position for more device sizes.
- Make the push-door transition feel more physical.
- Improve homepage scroll choreography and shader response.
- Replace placeholder links with real GitHub/Demo/Essay URLs.
- Optimize video loading and poster strategy.

Avoid:

- Replacing the static site with a heavy framework unless truly necessary.
- Reintroducing the old phone/peephole intro as the primary flow.
- Replacing the source-frame pixel handle with a mismatched 3D prop or decorative QTE outline.
- Adding new product claims or fake links.
- Turning the site into a generic SaaS landing page.
- Putting the main experience inside decorative card containers.
- Adding subtitles to the video.

## Validation Commands

Run from the repository root:

```bash
node --check script.js
```

Optional if Remotion sources change:

```bash
cd joi-doorway-video
npm run lint
```
