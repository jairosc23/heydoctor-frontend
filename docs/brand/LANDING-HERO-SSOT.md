# Landing Hero — Official Visual Identity (SSOT)

| Field | Value |
|-------|-------|
| **Status** | **OFFICIAL · FROZEN** |
| **Type** | Landing Page visual identity SSOT |
| **Asset** | `public/brand/hero-doctor.jpg` |
| **Resolution** | **1024×768** |
| **Rendering** | `object-contain` · `object-center` |
| **Change control** | Requires explicit Product + Brand approval |

This asset is the **official visual identity** of the HeyDoctor Landing Page.

---

## Identity

**FROZEN**

| Rule | Requirement |
|------|-------------|
| Never crop | Raised hand, face, Eko Core 500, patient thumbnail, and call controls must remain fully visible |
| Never replace | Do not swap, recreate, enhance, or re-export this asset |
| Container adapts to image | Aspect ratio and sizing follow the asset intrinsic ratio (1024×768) |
| Image never adapts to container | Do not use cropping fits (`object-cover`, scale-zoom, or similar) to force the frame |

---

## Asset

```
public/brand/hero-doctor.jpg
```

| Property | Value |
|----------|-------|
| Resolution | 1024×768 |
| Role | Official Landing Hero composite (physician + patient PiP + call controls) |
| Authority | Single Source of Truth for Landing Hero imagery |

---

## Rendering

Preferred (required):

```css
object-fit: contain;
object-position: center center;
```

| Allowed | Forbidden |
|---------|-----------|
| `object-contain` | `object-cover` (crops composition) |
| `object-center` / `center center` | Zoom / `scale` that clips edges |
| Container aspect-ratio = 1024 / 768 | Forcing the image into a mismatched crop box |

If additional width or height is needed, **adjust the container — not the image**.

---

## Acceptance

- Official asset unchanged at `public/brand/hero-doctor.jpg`
- Full composition preserved on desktop, tablet, and mobile
- No visual regressions from crop, replace, or enhance
- Layout/copy/CTA changes are out of scope of this SSOT (governed separately)

---

## Related implementation

| Path | Role |
|------|------|
| `public/brand/hero-doctor.jpg` | Frozen SSOT binary |
| `lib/landing-assets.constants.ts` | Intrinsic width/height + basename |
| `lib/landing-assets.server.ts` | Asset resolution |
| `components/landing/LandingHero.tsx` | Landing Hero consumer (must obey this SSOT) |
