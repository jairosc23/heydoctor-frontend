# HCX Iconography v1.0  
## Icon System Specification

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 1 — Foundations |
| **Document** | HCX Iconography |
| **Version** | 1.0 |
| **Status** | Official iconography specification — **no implementation** |
| **Path** | `docs/design/hcx/HCX-ICONOGRAPHY-v1.0.md` |

**Laws:** Spec only · no SVG library commits required by this directive · no React icon components · no commits mandated.

---

## 1. Purpose

Define a **single icon language** for HeyDoctor that reads as clinical, calm, and legible at small sizes — never playful emoji kits or mixed stroke systems.

---

## 2. Style principles

| Principle | Spec |
|-----------|------|
| Construction | Line icons (stroke), not heavy glyph fills by default |
| Stroke | 1.5–2px at 24px optical size |
| Joins / caps | Rounded |
| Grid | 24×24 keyline; 16 / 20 / 24 / 32 display sizes |
| Padding | Keep ~2px safe area inside viewBox |
| Corners | Align to HCX soft geometry — not sharp technical CAD |
| Metaphor | Clinical / operational clarity over illustration whimsy |
| Color | Inherit `currentColor`; status via semantic text color tokens |
| Pairing | Status icons **always** accompanied by text in clinical safety UI |

---

## 3. Optical sizes

| Size | Use |
|------|-----|
| 16 | Dense tables, meta inline |
| 20 | Compact toolbar |
| 24 | Default UI |
| 32 | Empty states, tele controls emphasis |

Do not freely scale stroke-based icons below 16 without a dedicated 16px set.

---

## 4. Categories (taxonomy)

### 4.1 Navigation & chrome
Home · Menu · Search · Settings · Help · Chevrons · Close · More

### 4.2 Clinical
Patient · Stethoscope/encounter · Vitals · Lab · Imaging · Prescription · Allergy · Warning · Critical · Timeline · Document · Consent · Identity

### 4.3 Communication
Message · Notification · Phone · Video · Mic · MicOff · Camera · CameraOff · ScreenShare

### 4.4 AI / assist (brand-aligned)
Spark **forbidden** as magic metaphor · Prefer: Assist, Suggest, Insight, Evidence — restrained geometric marks in brand color when active

### 4.5 Actions
Add · Edit · Save · Delete · Filter · Sort · Download · Upload · Print · Copy · Refresh

### 4.6 Status
Success · Info · Warning · Critical · Locked · Unlocked · Online · Offline · Syncing

### 4.7 Scheduling
Calendar · Clock · Waitlist · Room

---

## 5. Clinical safety icon rules

| Context | Rule |
|---------|------|
| Critical / allergy | Critical icon + text; never icon-only |
| Warning / unbound | Warning icon + text |
| HAB | Optional shield/authority mark; **buttons labeled in words** |
| Rx confirmation | Medication icon optional; list clarity primary |
| Identity mismatch | Critical identity icon + explicit copy |

**Forbidden:** Using a friendly “AI sparkle” to mean clinical confirmed fact.

---

## 6. Do / Don’t

| Do | Don’t |
|----|-------|
| One stroke system across app | Mix filled Material + outline SF Symbols randomly |
| Align metaphors to Latin American clinical practice clarity | Rely on culturally obscure glyphs |
| Keep HAB and Dispose iconography distinct | Reuse “check” for both Dispose and Confirm without label difference |
| Provide text alternative names | Emoji as system icons |
| Use brand color for active nav icons sparingly | Rainbow multi-color icons in chrome |

---

## 7. States

| State | Treatment |
|-------|-----------|
| Default | `text.secondary` or `text.primary` |
| Active | `brand.500` |
| Disabled | `opacity.disabled` |
| Destructive | `status.critical` |
| On brand fill | `text.onBrand` |

---

## 8. Accessibility

- Every informative icon has an accessible name (aria/label strategy in a11y standard)  
- Decorative icons marked decorative  
- Contrast: icons conveying meaning meet contrast with adjacent bg  
- Do not encode unique meaning in icon animation alone  

---

## 9. Library governance (future)

| Rule | Spec |
|------|------|
| SSOT set | Single HCX icon pack |
| Contributions | Same stroke, grid, naming |
| Naming | `hcx-icon-{category}-{name}` (future files) |
| Duotone | Optional later; not Phase 1 requirement |
| Custom clinic logos | Out of icon pack — brand assets |

---

## 10. Illustration vs icon

Icons = functional UI marks.  
Illustrations = empty states / marketing (see HCX Foundations illustration style).  
Do not use illustrations as 24px toolbar icons.

---

## Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| Asset production | Out of scope for this text spec |
| COS impact | **None** |

**End of HCX Iconography v1.0.**
