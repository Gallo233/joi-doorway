# Joi Doorway Video

This Remotion project generates the MP4 assets used by the root Joi Doorway static site.

## Compositions

- `IntroPhone` - vertical Joi Map phone-screen animation, rendered to `../assets/intro-phone.mp4`.
- `PeepholeJoi` - square close-up peephole animation, rendered to `../assets/peephole-joi.mp4`.
- `DoorwayPreview` - 14-second full storyboard preview, rendered to `out/doorway-preview.mp4`.

## Commands

```bash
npm i
npm run dev
npm run lint
npm run render:intro
npm run render:peephole
npm run render:preview
```

The render scripts use `--concurrency=1` because this local setup was more stable with Microsoft Edge as the configured browser executable.

## Notes

- Source assets live in `public/`.
- Generated preview output in `out/` is ignored by Git.
- Do not add subtitles or caption overlays to these videos unless the product direction changes.
