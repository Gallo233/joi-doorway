# Gemini Front-End Context

You are helping refine the front end for **Joi Doorway**, an interactive personal-site entrance for the All Joi ecosystem.

## Product Intent

This is not a normal portfolio landing page. It is a ritualized entrance:

1. First-person phone view opens Joi Map.
2. The viewer hears/feels a knock and approaches a warm apartment door.
3. The viewer drags or scrolls upward to open the peephole.
4. Joi Map appears close to the peephole.
5. The viewer pushes the door open and enters the All Joi studio homepage.

The emotional goal is: **Joi is not just a product page; she feels like a real partner arriving at the edge of the user's world.**

## Hard Character Constraints

- Joi App and Joi Map are the same character in different outfits/contexts.
- Both versions have honey-amber eyes.
- Joi App has no side braid.
- Joi Map has the side braid with coral ribbon. This is a Map-only identity marker.
- Keep the Japanese anime style, but avoid sci-fi, robot, cyberpunk, excessive gloss, and spaceship/dashboard aesthetics.
- Avoid making Joi overly childish or sexualized.
- Do not add subtitles/caption overlays inside the generated videos.
- Do not add long in-app explanations of how the interface works.

## Current Files

Root static site:

- `index.html`
- `styles.css`
- `script.js`
- `assets/doorway-bg.png`
- `assets/joi-app-v3.png`
- `assets/joi-map-v3.png`
- `assets/joi-peephole-closeup.png`
- `assets/intro-phone.mp4`
- `assets/peephole-joi.mp4`

Remotion video source:

- `joi-doorway-video/src/Composition.tsx`
- `joi-doorway-video/src/Root.tsx`
- `joi-doorway-video/public/*`

## Interaction Model

The intro state machine is in `script.js`:

```text
phoneIntro -> doorApproach -> peepholeLocked -> peepholeOpen -> doorOpen -> home
```

Important behavior:

- `?skipIntro=1` should enter the homepage directly.
- Phone and peephole videos use `data-video-autoload="true"`.
- If videos fail, the page should still show image fallbacks.
- Mouse wheel and pointer drag both open the peephole.
- The final homepage should remain usable as an embeddable personal-site section.

## Front-End Improvement Priorities

Good areas to improve:

- Make the intro transitions more cinematic and less abrupt.
- Improve responsive composition on desktop, tablet, and mobile.
- Refine the door, peephole, and push-door visual timing.
- Improve accessibility without adding visible explanatory clutter.
- Optimize asset loading and perceived performance.
- Improve visual polish of project cards and studio sections.

Avoid:

- Replacing the core state machine with a heavy framework unless truly necessary.
- Removing video fallbacks.
- Adding new product claims or fake links.
- Turning the site into a generic SaaS landing page.
- Putting the main experience inside decorative card containers.

## Validation Commands

Run from the repository root:

```bash
node --check script.js
```

Run from the Remotion folder:

```bash
cd joi-doorway-video
npm run lint
```

Render videos if Remotion sources change:

```bash
cd joi-doorway-video
npm run render:intro
npm run render:peephole
```
