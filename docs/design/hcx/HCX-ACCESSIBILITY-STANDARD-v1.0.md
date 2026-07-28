# HCX Accessibility Standard v1.0  
## Inclusive, Clinically Readable Experience

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 1 — Foundations |
| **Document** | HCX Accessibility Standard |
| **Version** | 1.0 |
| **Status** | Official a11y specification — **no implementation** |
| **Path** | `docs/design/hcx/HCX-ACCESSIBILITY-STANDARD-v1.0.md` |

**Laws:** Spec only · no code · no commits.  
**Prime directive:** If a clinician or patient cannot perceive, operate, or understand a control safely, the design is incomplete — regardless of aesthetics.

---

## 1. WCAG strategy

| Item | HCX v1.0 |
|------|----------|
| Target | **WCAG 2.2 Level AA** minimum |
| Stretch | AAA for critical clinical prose and alerts where feasible |
| Scope | All Experience layers: physician, patient, staff, tele, admin |
| Exceptions | None for HAB, Rx confirmation, critical alerts, consent, identity |
| Conformance | Design-time rules here; future implementation must verify |

HCX does not weaken AA for “premium glass” effects — glass is restricted where it harms contrast (Foundations).

---

## 2. Contrast

| Element | Minimum |
|---------|---------|
| Body text | 4.5:1 |
| Large text (≥18.66px bold / 24px) | 3:1 |
| UI components & graphical objects | 3:1 against adjacent colors |
| Focus ring | Visible against both canvas and chrome |
| Text on brand primary | Use `text.onBrand`; verify ≥4.5:1 |
| Warning/critical text on soft fills | Verify AA on soft backgrounds |

**Forbidden:** Light gray text on mist for clinical body; low-contrast placeholders as only instruction.

---

## 3. Motion reduction

| Preference | Behavior |
|------------|----------|
| `prefers-reduced-motion` | Essential state changes without decorative motion (see Motion System) |
| `prefers-reduced-transparency` | Solid surfaces; no reliance on blur for hierarchy |
| Vestibular safety | No parallax in workspace; no large zoom pulses |

Success/warning/error must remain understandable **without motion**.

---

## 4. Focus

| Rule | Spec |
|------|------|
| Visibility | Focus ring always visible for keyboard users (`hcx.focus.*`) |
| Order | Logical DOM/reading order matches visual order |
| Trap | Modals/HAB trap focus; restore on close |
| Skip | Skip-to-content for app chrome on complex pages |
| Never | `outline: none` without equivalent |

HAB and critical dialogs receive focus on open.

---

## 5. Keyboard

| Requirement | Spec |
|-------------|------|
| Operable | All core tasks reachable without pointer |
| Shortcuts | Documented; do not override assistive tech conventions casually |
| Tables | Arrow/row patterns when custom; otherwise native semantics |
| Escape | Closes overlays unless destructive confirmation requires explicit choice |
| Encounter | Navigate zones and primary actions via keyboard |

Staff/patient experiences must not assume hover-only affordances.

---

## 6. Screen readers

| Rule | Spec |
|------|------|
| Names | Every control has accessible name |
| Icons | Informative icons named; decorative hidden |
| Live regions | Fail-closed, critical alerts, connection loss announced |
| Status | Provisional AI content announced as suggestion, not fact |
| HAB | Challenge purpose announced; result announced on decision |
| Tables | Headers associated; complex clinical tables summarized |
| Dynamic | AI streaming should not flood SR — summarize or gate updates |

**Language:** Match UI locale; clinical codes may remain coded with human-readable adjacent text.

---

## 7. Clinical readability

| Topic | Spec |
|-------|------|
| Type size | Body 15–16px desktop; ≥16px mobile inputs |
| Line length | Prefer ~45–75 characters for long notes |
| Line height | ≥1.5 for clinical body |
| Tabular nums | Doses, vitals, IDs |
| Hierarchy | One clear H1 equivalent per view |
| Density | Compact mode must not drop below readable AA |
| Ambiguity | Abbreviations expanded on first use in patient UX |
| Color | Never sole indicator for allergy, severity, selected state |

---

## 8. Touch & motor

| Rule | Spec |
|------|------|
| Target size | ≥ 44×44 px (touch density) |
| Spacing | Adequate gap between destructive and primary |
| Drag | Provide non-drag alternative |
| Timeout | Warn before session end; extend accessible |

---

## 9. Cognitive load & calm

| Rule | Spec |
|------|------|
| One primary action | Per focus zone |
| Progressive disclosure | Advanced detail optional |
| Error copy | Plain language + recovery step |
| Patient UX | Avoid clinician jargon |
| Interruptions | Toasts do not replace HAB/critical |

---

## 10. Clinical safety surfaces (a11y non-negotiables)

| Surface | Requirement |
|---------|-------------|
| HAB | Labeled; keyboard; focus trap; unbound state announced; Confirm ≠ Dispose naming |
| Prescription confirmation | Full medication text readable by SR; confirm distinct |
| Clinical warnings | Role=status/alert as appropriate; not toast-only |
| Critical alerts | Assertive live region when appearing |
| Consent | Full text available; not behind hover |
| Identity verification | Mismatch announced as critical |

---

## 11. Forms

- Labels always visible (not placeholder-only)  
- Errors inline and associated  
- Required fields indicated textually  
- Group related controls with legends  
- Disable submit clarity when invalid — explain why  

---

## 12. Media & telemedicine

- Captions/subtitles strategy when recordings exist (product-dependent)  
- Connection status textually available  
- Mute/camera state announced  
- Do not rely on color alone for connection quality  

---

## 13. Testing expectations (future implementation)

| Layer | Expectation |
|-------|-------------|
| Design QA | Contrast and focus reviewed in Figma/spec |
| Automated | axe/lighthouse-class checks in CI (later) |
| Manual | Keyboard + SR smoke on encounter, HAB, portal, tele |
| Regression | Critical paths listed in Experience taxonomy |

---

## 14. Relationship to COS

HCX Accessibility Standard governs **presentation and interaction**.  
It does **not** change fail-closed engine behavior, HAB rules, or emission — it ensures those states are **perceivable and operable** when shown.

---

## 15. Checklist (design acceptance)

- [ ] AA contrast verified for text and critical UI  
- [ ] Focus order and visible focus specified  
- [ ] Keyboard path for primary tasks specified  
- [ ] SR names/live regions specified for safety surfaces  
- [ ] Reduced motion / transparency paths specified  
- [ ] Touch targets ≥ 44px where touch density applies  
- [ ] Dispose vs Confirm naming distinct for AT users  

---

## Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| COS / EDP impact | **None** |

**End of HCX Accessibility Standard v1.0.**
