# HCX Foundations v1.0  
## HeyDoctor Clinical Experience System — Phase 1

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 1 — Foundations |
| **Document** | HCX Foundations |
| **Version** | 1.0 |
| **Status** | Official foundation specification — **no implementation** |
| **Parent** | `docs/design/HEYDOCTOR-CLINICAL-EXPERIENCE-SYSTEM-v1.0.md` |
| **Path** | `docs/design/hcx/HCX-FOUNDATIONS-v1.0.md` |
| **Independence** | HCX ≠ COS · does not modify Architecture, EDPs, HAB/Context/PE engines |

**Laws:** Specification only · no React · no Tailwind · no CSS · no commits.

---

## 1. Purpose

Define the **foundational visual measurements and material rules** that every future HeyDoctor frontend must consume. Foundations are the physical grammar of HCX; tokens name them; components compose them.

---

## 2. Spacing scale

**Base unit:** 4px  
**Scale name:** `space`

| Step | Value | Alias use |
|------|-------|-----------|
| 0 | 0 | Collapse |
| 1 | 4px | Hair gaps, icon padding |
| 2 | 8px | Compact inline |
| 3 | 12px | Dense stacks |
| 4 | 16px | Default gap |
| 5 | 20px | Comfortable inline |
| 6 | 24px | Section inner |
| 7 | 32px | Section break |
| 8 | 40px | Zone padding |
| 9 | 48px | Large zone |
| 10 | 64px | Page rhythm |
| 11 | 80px | Rare hero only |
| 12 | 96px | Marketing only |

**Rules**

- Clinical work surfaces prefer steps 3–7.  
- Do not invent off-scale values (e.g. 13px, 18px) except optical 1px borders.  
- Density modes multiply perceived spacing (see §10), not a second scale.

---

## 3. Typography scale

### 3.1 Families (roles, not font files)

| Role | Intent |
|------|--------|
| `font.display` | Brand / rare hero |
| `font.ui` | Chrome, forms, tables |
| `font.clinical` | Long-form clinical reading (may equal ui) |
| `font.mono` | Codes, doses, vitals, IDs (tabular nums) |

### 3.2 Size scale

| Step | Size | Line height | Use |
|------|------|-------------|-----|
| `display` | 32–40px | 1.2 | Landing / empty hero |
| `title` | 22–24px | 1.25 | Page / encounter title |
| `section` | 17–18px | 1.35 | Zone headers |
| `body` | 15–16px | 1.5 | Clinical body |
| `body.sm` | 14px | 1.45 | Compact tables |
| `meta` | 12–13px | 1.4 | Timestamps, helpers |
| `micro` | 11px | 1.35 | Uppercase labels only |

**Mobile rule:** Where text inputs exist, body ≥ 16px.

### 3.3 Weight scale

| Token | Use |
|-------|-----|
| `regular` (400) | Body |
| `medium` (500) | UI emphasis |
| `semibold` (600) | Titles, HAB primary actions |
| `bold` (700) | Rare; never default body |

**Forbidden:** Ultra-light weights for clinical text.

### 3.4 Brand wordmark

Primary brand color only (see color primitives). Follow Branding SSOT for logo composition — foundations do not redefine the mark asset.

---

## 4. Color primitives

Primitives are **raw palette values**. Semantics map onto them (see companion tokens doc).

### 4.1 Brand

| Primitive | Value |
|-----------|-------|
| `brand.500` | `#078A92` |
| `brand.600` | `#056B72` |
| `brand.400` | `#0A9AA3` |
| `brand.100` | `#E6F5F6` |
| `brand.50` | `#F0F7F8` |

### 4.2 Neutral (cool teal undertone)

| Primitive | Value |
|-----------|-------|
| `neutral.950` | `#0F1C1E` |
| `neutral.700` | `#3D5256` |
| `neutral.500` | `#6B7F84` |
| `neutral.200` | `#E8EEF0` |
| `neutral.100` | `#F4F7F8` |
| `neutral.50` | `#F8FAFB` |
| `neutral.0` | `#FFFFFF` |

### 4.3 Semantic primitives

| Family | Core | Soft |
|--------|------|------|
| Success | `#0F7A5F` | `#E6F4EF` |
| Warning | `#B45309` | `#FEF3C7` |
| Critical | `#B42318` | `#FEE4E2` |
| Info | `#3B6B73` | `#E8F0F2` |

### 4.4 Anti-primitives (never introduce as brand)

Purple/indigo AI defaults · terracotta/cream editorial sets · neon accents as primary identity.

---

## 5. Semantic colors

| Semantic role | Maps to | Surfaces |
|---------------|---------|----------|
| `text.primary` | neutral.950 | All reading |
| `text.secondary` | neutral.700 | Supporting |
| `text.muted` | neutral.500 | Meta |
| `text.onBrand` | neutral.0 | On primary buttons |
| `bg.canvas` | neutral.100 | App atmosphere |
| `bg.chrome` | neutral.0 | Nav |
| `bg.raised` | neutral.0 | Work panels |
| `bg.muted` | neutral.50 | Wells |
| `bg.brandSoft` | brand.100 | Selection, HAB wash |
| `border.subtle` | neutral.200 | Default lines |
| `border.brand` | brand.500 @ low emphasis | Focus / HAB rail |
| `action.primary` | brand.500 | Primary CTA |
| `action.primaryHover` | brand.600 | Hover |
| `status.success` | success core | Safe feedback |
| `status.warning` | warning core | Caution, unbound |
| `status.critical` | critical core | Alerts, deny |
| `status.info` | info core | Guidance |

**Rule:** Semantics never sole-channel meaning — pair with label/icon.

---

## 6. Elevations

| Level | Name | Intent |
|-------|------|--------|
| `elevation.0` | Flat | Canvas, long reading |
| `elevation.1` | Resting | Rows, subtle panels |
| `elevation.2` | Raised | Rails, modules |
| `elevation.3` | Floating | Popovers, command palette |
| `elevation.4` | Authority | HAB, critical modals |

Stacking philosophy: prefer border + elevation.1–2; reserve 3–4 for true float/authority.

---

## 7. Shadows

Cool teal-black undertone (`rgba(2, 44, 44, α)` spirit):

| Elevation | Shadow recipe (spec) |
|-----------|----------------------|
| 0 | none |
| 1 | `0 1px 2px` @ ~0.05 |
| 2 | `0 2px 10px` @ ~0.06 |
| 3 | `0 8px 24px` @ ~0.08 |
| 4 | `0 12px 32px` with brand tint ~0.12 |

**Forbidden:** Neon glows, multi-layer rainbow shadows, heavy drop shadows on body text containers.

---

## 8. Glass rules

| Allowed | Forbidden |
|---------|-----------|
| App chrome over scrolling content | Glass over clinical notes / Rx / HAB / consent text |
| Tele lobby ambience | Nested frost stacks |
| Marketing / auth atmosphere | Glass as only contrast for body copy |

**Fill range:** 72–86% white opacity on light theme.  
**Edge:** 1px brand- or neutral-tinted.  
**Always** define solid chrome fallback.

---

## 9. Blur rules

| Token intent | Spec |
|--------------|------|
| `blur.chrome` | 12–16px |
| `blur.lobby` | 16–20px max |
| Nesting | Max **one** full-width frosted layer per view |
| Reduced transparency | Disable blur; use solid surfaces |
| Performance | No permanent full-viewport filters on encounter work |

---

## 10. Border radius

| Step | Value | Use |
|------|-------|-----|
| `radius.sm` | 8px | Inputs, small controls |
| `radius.md` | 12px | Buttons, panels |
| `radius.lg` | 16px | Sheets, large panels |
| `radius.xl` | 20px | Rare soft containers |
| `radius.pill` | 9999px | Tags/chips **only** |

Primary actions: prefer `radius.md`, not pill-by-default.

---

## 11. Density

| Mode | Spacing bias | Type bias | Where |
|------|--------------|-----------|-------|
| `comfortable` | +1 step | body 15–16 | Notes, portal |
| `compact` | −1 step | body.sm / meta | Agenda, admin tables |
| `touch` | targets ≥ 44px | body ≥ 16 | Mobile, tele controls |

Density changes **rhythm**, not brand colors or elevation meanings.

---

## 12. Responsive grid

### Breakpoints

| Name | Min width | Columns | Workspace intent |
|------|-----------|---------|------------------|
| `sm` | 0 | 4 | Single column |
| `md` | 768 | 8 | Dual; assist as sheet |
| `lg` | 1024 | 12 | Dual/tri emerging |
| `xl` | 1280 | 12 | Tri-zone workspace |

### Grid rules

- Margins: space.4–space.6 on clinical pages.  
- Gutter: space.3–space.4.  
- Workspace zones map to columns; **do not** change HAB semantics by breakpoint — only placement (e.g. full-screen confirm on sm).

### Zone map (xl)

| Zone | Approx columns |
|------|----------------|
| Orientation / timeline | 3 |
| Clinical work | 6 |
| Assist | 3 |
| Confirmation | Full width band or modal overlay when active |

---

## 13. Dark mode philosophy

| Decision | HCX v1.0 |
|----------|----------|
| Default identity | **Light** clinical paper |
| Dark mode | **Optional future theme**, not a second brand |
| When allowed later | Must preserve semantic meaning, contrast AA, HAB clarity |
| Forbidden | Dark as default; purple neon dark “AI” skin; inverting clinical safety colors arbitrarily |
| Glass in dark | Higher opacity fills; never lower contrast on warnings/critical |

Foundations **do not** ship a dark palette in Phase 1 — only the philosophy above.

---

## 14. Surface hierarchy (recap)

1. Atmosphere (canvas)  
2. Chrome (nav — glass optional)  
3. Work (opaque)  
4. Assist (soft brand wash + opaque content)  
5. Authority / HAB (highest attention, elevation.4, opaque)

---

## 15. Companion documents

| Document | Role |
|----------|------|
| `HCX-DESIGN-TOKENS-v1.0.md` | Canonical token names |
| `HCX-COMPONENT-TAXONOMY-v1.0.md` | Component hierarchy |
| `HCX-MOTION-SYSTEM-v1.0.md` | Motion foundations |
| `HCX-ICONOGRAPHY-v1.0.md` | Icon system |
| `HCX-ACCESSIBILITY-STANDARD-v1.0.md` | A11y standard |

---

## Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| COS impact | **None** |

**End of HCX Foundations v1.0.**
