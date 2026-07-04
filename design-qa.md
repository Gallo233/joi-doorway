# All Joi Design QA

Status: passed for the current Next.js full-site clone pass

## Reference Intent

- Keep the All Joi light, warm visual temperament instead of switching to the source site's dark palette.
- Preserve the source site's interaction mechanisms: soft 3D word, sticker layer, grid/crosshair field, real project tiles, inverted speed-line interlude, sticky scroll beats, bottom HUD, project detail routes, and tight motion rhythm.
- Replace source content with the current All Joi ecosystem work from `Gallo233` GitHub projects.

## Evidence

- Source desktop reference: `docs/design-references/haoqi.design/desktop-after-wait.png`
- Desktop hero: `docs/design-references/all-joi-next-desktop-hero-final.png`
- Desktop work section: `docs/design-references/all-joi-next-desktop-work-final.png`
- Desktop sticky section: `docs/design-references/all-joi-next-desktop-sticky-final.png`
- Full-site desktop hero: `docs/design-references/all-joi-fullsite-home-hero.png`
- Full-site speed section: `docs/design-references/all-joi-fullsite-speed.png`
- Full-site project page: `docs/design-references/all-joi-fullsite-project-joi.png`
- Full-site mobile home: `docs/design-references/all-joi-fullsite-mobile-home.png`
- Full-site mobile project: `docs/design-references/all-joi-fullsite-mobile-project.png`
- Mobile hero: `docs/design-references/all-joi-next-mobile-hero-final.png`
- Mobile sticky section: `docs/design-references/all-joi-next-mobile-sticky-final.png`

## Checks

- `node --check script.js` passed.
- `node --check three-title.js` passed.
- `git diff --check` passed.
- `pnpm exec next build` passed.
- Desktop and mobile `?skipIntro=1` verification passed on `http://127.0.0.1:4178`.
- Three.js wordmark reaches `is-three-ready` on desktop and mobile.
- All image assets load successfully.
- Horizontal overflow is `0` on desktop and mobile.
- Desktop work heading now stays inside the 1440px viewport.
- Home project cards now link to internal routes instead of only external GitHub pages.
- Six project detail pages build as static routes through `app/[slug]/page.tsx`.
- Full home includes source-style speed interlude, principle fragments, and CTA footer.
- Sticky process section sticks at the top of the viewport on desktop and mobile.
- Browser console has no page-script errors. Next dev may retain Fast Refresh warnings after server restarts or hot updates.

## Remaining Taste Notes

- The page intentionally uses a light cream/ice grid and warm amber/aqua accents, so it is a light reinterpretation of the source site's structure rather than a dark clone.
- The 3D `all joi` wordmark is procedural tube geometry with pale glossy material, so it reads as a soft background object instead of the earlier purple foreground obstruction.
