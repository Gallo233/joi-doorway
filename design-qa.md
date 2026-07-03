# All Joi Design QA

Status: passed

## Reference Intent

- Keep the All Joi light, warm visual temperament instead of switching to the source site's dark palette.
- Preserve the source site's interaction mechanisms: soft 3D word, sticker layer, grid/crosshair field, real project tiles, sticky scroll beats, bottom HUD, and tight motion rhythm.
- Replace source content with the current All Joi ecosystem work.

## Evidence

- Source reference frames: `/tmp/joi-reference-audit/reference-contact-sheet.jpg`
- Desktop hero: `/tmp/joi-reference-audit/all-joi-desktop-hero.png`
- Desktop work section: `/tmp/joi-reference-audit/all-joi-desktop-work.png`
- Mobile hero: `/tmp/joi-reference-audit/all-joi-mobile-hero.png`
- Mobile sticky process: `/tmp/joi-reference-audit/all-joi-mobile-process.png`

## Checks

- Desktop and mobile browser verification passed with no console errors.
- Three.js wordmark reaches `is-three-ready` on desktop and mobile.
- All image assets load successfully.
- Horizontal overflow is `0` on desktop and mobile.
- Sticky process section sticks at the top of the viewport on desktop and mobile.
- Mobile typography was tightened so the longest words in the hero and sticky sections no longer clip.

## Remaining Taste Notes

- The page intentionally uses a light cream grid and amber/aqua warmth, so it is a light reinterpretation of the source site's structure rather than a dark clone.
- The 3D `all joi` wordmark is procedural tube geometry, which gives a soft glossy inflated feel without relying on external font loaders.
