# HCX Design Tokens v1.0  
## Canonical Token Architecture — Specification Only

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 1 — Foundations |
| **Document** | HCX Design Tokens |
| **Version** | 1.0 |
| **Status** | Canonical token architecture — **no implementation** |
| **Parent** | HCX v1.0 · HCX Foundations v1.0 |
| **Path** | `docs/design/hcx/HCX-DESIGN-TOKENS-v1.0.md` |

**Laws:** Spec only · no CSS variables in repo via this directive · no Tailwind maps · no commits.  
**Bridge note:** Future implementation may map `hcx.*` → existing `--hd-*` where overlapping; this doc is SSOT for names.

---

## 1. Purpose

Provide a **single naming architecture** so every product surface references the same decisions. Tokens are contracts; values live in Foundations.

---

## 2. Naming convention

```
hcx.{group}.{role}[.{variant}][.{state}]
```

| Part | Meaning |
|------|---------|
| `hcx` | System namespace |
| `group` | color, space, font, radius, elevation, blur, motion, border, z, bp, density, opacity |
| `role` | Semantic purpose |
| `variant` | Optional scale step |
| `state` | Optional hover, focus, disabled, pressed |

**Examples**

- `hcx.color.brand.primary`  
- `hcx.space.4`  
- `hcx.font.size.body`  
- `hcx.motion.duration.fast`  
- `hcx.elevation.4`  

**Forbidden names:** Ad-hoc (`blueButton`, `cardShadow2`, `aiPurple`).

---

## 3. Layers of tokens

```
Primitive tokens     → raw values (brand.500, space.4)
        ↓
Semantic tokens      → purpose (text.primary, bg.canvas)
        ↓
Component tokens     → optional later (button.primary.bg) — not required in Phase 1
```

Phase 1 mandates **primitive + semantic**. Component-level tokens are deferred until taxonomy stabilizes.

---

## 4. Color tokens

### 4.1 Primitive

| Token | Value ref |
|-------|-----------|
| `hcx.color.brand.50` | Foundations brand.50 |
| `hcx.color.brand.100` | brand.100 |
| `hcx.color.brand.400` | brand.400 |
| `hcx.color.brand.500` | brand.500 `#078A92` |
| `hcx.color.brand.600` | brand.600 |
| `hcx.color.neutral.0` | `#FFFFFF` |
| `hcx.color.neutral.50` … `950` | Foundations neutrals |
| `hcx.color.success.500` / `.100` | Semantic success |
| `hcx.color.warning.500` / `.100` | Semantic warning |
| `hcx.color.critical.500` / `.100` | Semantic critical |
| `hcx.color.info.500` / `.100` | Semantic info |

### 4.2 Semantic

| Token | Intent |
|-------|--------|
| `hcx.color.text.primary` | Main ink |
| `hcx.color.text.secondary` | Secondary ink |
| `hcx.color.text.muted` | Meta |
| `hcx.color.text.onBrand` | Text on primary fill |
| `hcx.color.text.link` | Inline links (brand.600) |
| `hcx.color.bg.canvas` | Page atmosphere |
| `hcx.color.bg.chrome` | Nav solid fallback |
| `hcx.color.bg.raised` | Work panels |
| `hcx.color.bg.muted` | Nested wells |
| `hcx.color.bg.brandSoft` | Selection / HAB wash |
| `hcx.color.bg.warningSoft` | Warning banners |
| `hcx.color.bg.criticalSoft` | Critical banners |
| `hcx.color.border.subtle` | Default |
| `hcx.color.border.brand` | Emphasis / HAB rail |
| `hcx.color.border.warning` | Caution |
| `hcx.color.border.critical` | Danger |
| `hcx.color.action.primary` | Primary CTA fill |
| `hcx.color.action.primaryHover` | Hover |
| `hcx.color.action.primaryPressed` | Pressed |
| `hcx.color.action.secondaryBorder` | Secondary CTA |
| `hcx.color.action.destructive` | Destructive CTA |
| `hcx.color.focus.ring` | Focus ring (brand) |
| `hcx.color.status.success` | Success fg |
| `hcx.color.status.warning` | Warning fg |
| `hcx.color.status.critical` | Critical fg |
| `hcx.color.status.info` | Info fg |

**AI assist:** use `bg.brandSoft` + `text.secondary` — **no** `hcx.color.ai.purple`.

---

## 5. Typography tokens

| Token | Maps to |
|-------|---------|
| `hcx.font.family.display` | Display role |
| `hcx.font.family.ui` | UI role |
| `hcx.font.family.clinical` | Clinical reading |
| `hcx.font.family.mono` | Mono / tabular |
| `hcx.font.size.display` | 32–40 |
| `hcx.font.size.title` | 22–24 |
| `hcx.font.size.section` | 17–18 |
| `hcx.font.size.body` | 15–16 |
| `hcx.font.size.bodySm` | 14 |
| `hcx.font.size.meta` | 12–13 |
| `hcx.font.size.micro` | 11 |
| `hcx.font.weight.regular` | 400 |
| `hcx.font.weight.medium` | 500 |
| `hcx.font.weight.semibold` | 600 |
| `hcx.font.weight.bold` | 700 |
| `hcx.font.lineHeight.tight` | ~1.2 |
| `hcx.font.lineHeight.snug` | ~1.35 |
| `hcx.font.lineHeight.normal` | ~1.5 |
| `hcx.font.letterSpacing.label` | Slight tracking for micro labels |

---

## 6. Spacing tokens

| Token | Value |
|-------|-------|
| `hcx.space.0` … `hcx.space.12` | Foundations spacing steps |

Aliases (optional semantic):

| Token | Equals |
|-------|--------|
| `hcx.space.inset.xs` | space.2 |
| `hcx.space.inset.sm` | space.3 |
| `hcx.space.inset.md` | space.4 |
| `hcx.space.inset.lg` | space.6 |
| `hcx.space.stack.sm` | space.3 |
| `hcx.space.stack.md` | space.4 |
| `hcx.space.stack.lg` | space.6 |
| `hcx.space.section` | space.7 |

---

## 7. Radius tokens

| Token | Value |
|-------|-------|
| `hcx.radius.sm` | 8 |
| `hcx.radius.md` | 12 |
| `hcx.radius.lg` | 16 |
| `hcx.radius.xl` | 20 |
| `hcx.radius.pill` | full |

---

## 8. Elevation & shadow tokens

| Token | Intent |
|-------|--------|
| `hcx.elevation.0` … `4` | Level semantics |
| `hcx.shadow.1` | Resting |
| `hcx.shadow.2` | Raised |
| `hcx.shadow.3` | Floating |
| `hcx.shadow.4` | Authority / focus modal |

---

## 9. Blur & opacity tokens

| Token | Spec |
|-------|------|
| `hcx.blur.none` | 0 |
| `hcx.blur.chrome` | 12–16 |
| `hcx.blur.lobby` | 16–20 |
| `hcx.opacity.glass.fill` | 0.72–0.86 |
| `hcx.opacity.disabled` | ~0.4 |
| `hcx.opacity.overlayScrim` | ~0.4–0.5 |

---

## 10. Border tokens

| Token | Intent |
|-------|--------|
| `hcx.border.width.hair` | 1px |
| `hcx.border.width.emphasis` | 2px (HAB top rail) |
| `hcx.border.color.subtle` | → color.border.subtle |
| `hcx.border.color.brand` | → color.border.brand |

---

## 11. Motion tokens

| Token | Value |
|-------|-------|
| `hcx.motion.duration.fast` | 150ms |
| `hcx.motion.duration.base` | 200ms |
| `hcx.motion.duration.slow` | 250–320ms |
| `hcx.motion.duration.continuity` | ≤400ms |
| `hcx.motion.easing.standard` | ease-out / product standard |
| `hcx.motion.easing.spatial` | ease-in-out |
| `hcx.motion.easing.linear` | Progress only |

See `HCX-MOTION-SYSTEM-v1.0.md` for usage rules.

---

## 12. Breakpoint tokens

| Token | Min width |
|-------|-----------|
| `hcx.bp.sm` | 0 |
| `hcx.bp.md` | 768 |
| `hcx.bp.lg` | 1024 |
| `hcx.bp.xl` | 1280 |

---

## 13. Z-index tokens

| Token | Band | Intent |
|-------|------|--------|
| `hcx.z.base` | 0 | Content |
| `hcx.z.chrome` | 30 | Nav |
| `hcx.z.moduleBackdrop` | 45 | Module dim |
| `hcx.z.module` | 46 | Module panel |
| `hcx.z.assistBackdrop` | 40 | Assist dim (if any) |
| `hcx.z.assist` | 50 | Assist shelf |
| `hcx.z.hab` | 55 | Authority mount / modal |
| `hcx.z.system` | 60 | System toasts / critical |

Exact integers may align with legacy overlay contract during implementation mapping.

---

## 14. Density tokens

| Token | Meaning |
|-------|---------|
| `hcx.density.mode` | `comfortable` \| `compact` \| `touch` |
| `hcx.density.targetMin` | 44 (touch) |

---

## 15. Focus tokens

| Token | Intent |
|-------|--------|
| `hcx.focus.ring.color` | brand primary |
| `hcx.focus.ring.width` | 2px |
| `hcx.focus.ring.offset` | 2px |

---

## 16. Legacy bridge (informative)

| Legacy spirit | HCX token |
|---------------|-----------|
| `--hd-surface-base` | `hcx.color.bg.canvas` |
| `--hd-border-subtle` | `hcx.color.border.subtle` |
| `--hd-shadow-*` | `hcx.shadow.*` |
| `--hd-motion-*` | `hcx.motion.duration.*` |
| `--hd-radius-*` | `hcx.radius.*` |
| primary `#078A92` | `hcx.color.brand.500` |

Bridge is **mapping guidance**, not permission to keep dual SSOTs forever. Post-adoption, `hcx.*` is canonical.

---

## 17. Governance

1. New tokens require HCX review.  
2. No product-specific color forks.  
3. Component tokens (Phase later) must reference semantic tokens, not raw hex.  
4. Dark theme tokens (future) are a **theme layer**, not a rename of brand.

---

## Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| COS impact | **None** |

**End of HCX Design Tokens v1.0.**
