# ADR 0007: Responsive WebP variants for local photos

- Status: Accepted
- Date: 2026-10-06

## Context

Photos in `apps/web/static/images` were recompressed (ADR 0006), but phones still
downloaded the full 1000–1920px file for a 300px card.

## Decision

- Each local photo gets 480px and 960px WebP variants in `static/images/w/`
  (`<name>-<width>.webp`). Variants are committed, not built at deploy time.
- `packages/ui/src/site/responsive-images.ts` lists them and exposes
  `responsiveSrcset(src)`. Components add `srcset={responsiveSrcset(url)}` to the
  existing `<img>`; `src` stays as the fallback and as the largest candidate.
- Anything not listed (CMS uploads, icons, remote URLs) returns `undefined`, so
  the attribute is omitted and behaviour is unchanged.
- `responsive-images.test.ts` fails if the manifest names a file that is missing.

## Adding or replacing a photo

Put the recompressed original in `static/images/`, then regenerate its variants
and update the manifest line. With Pillow:

```python
from PIL import Image
im = Image.open("image01.jpeg").convert("RGB"); W, H = im.size
for w in (480, 960):
    if W > w + 40:
        im.resize((w, round(H * w / W)), Image.LANCZOS).save(f"w/image01-{w}.webp", "WEBP", quality=72, method=6)
```

## Consequences

About 2.9 MB of extra static files. Page-weight limits in `page-weight.test.ts`
cover the originals; `w/` is checked for the same per-image cap.
