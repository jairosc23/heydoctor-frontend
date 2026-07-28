# HCX Surface Recipes v1.0  
## Implementation-Independent Visual Surface Contracts

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 4 — Surface Recipes & Wireframe Contracts |
| **Document** | HCX Surface Recipes |
| **Version** | 1.0 |
| **Status** | Official — **no implementation** |
| **Consumes** | Blueprints · Experience Patterns · Foundations · Motion · A11y |
| **Path** | `docs/design/hcx/HCX-SURFACE-RECIPES-v1.0.md` |

**Laws:** Spec only · no React · no CSS · no Tailwind · no code · no commits.  
**Surfaces** describe *what a region of the UI is for* — not components or tech.

Each recipe uses:

| Field | Meaning |
|-------|---------|
| Purpose | Why the surface exists |
| Information Priority | First → last |
| Allowed Interactions | Verbs permitted |
| Forbidden Interactions | Hard UX bans |
| Cognitive Load | How we keep it low |
| Accessibility | A11y notes |
| Motion Behaviour | Allowed motion |
| Responsive Behaviour | Breakpoint behaviour |
| Relation with HCX Patterns | Patterns consumed |
| Relation with COS | Consume only — no redefine |

---

## 1. Workspace Header

| Field | Spec |
|-------|------|
| **Purpose** | Anchor brand, identity, and global entry without stealing clinical focus. |
| **Information Priority** | Brand → patient/encounter (if in care) → nav → alerts badge. |
| **Allowed** | Navigate · open search · open notifications · show identity. |
| **Forbidden** | HAB Confirm · Emit · burying critical alert solely here as toast. |
| **Cognitive Load** | Single bar; no KPI strip. |
| **Accessibility** | Landmark banner; skip-to-content. |
| **Motion** | Stable; badge update `fast`. |
| **Responsive** | Collapse nav to menu on sm. |
| **Patterns** | Auth (entry) · Dashboard · Notification. |
| **COS** | Presents tenancy/role chrome — no auth engine change. |

---

## 2. Workspace Navigation

| Field | Spec |
|-------|------|
| **Purpose** | Move between product areas without reinventing IA per role. |
| **Information Priority** | Current location → primary destinations → secondary. |
| **Allowed** | Route to agenda, patients, settings (by role). |
| **Forbidden** | Shortcut Assist→Confirm · staff HAB items. |
| **Cognitive Load** | Short list; clear current state. |
| **Accessibility** | Nav landmark; aria-current. |
| **Motion** | Instant or `fast` highlight. |
| **Responsive** | Bottom or drawer on mobile. |
| **Patterns** | Dashboard · role blueprints. |
| **COS** | Respects role rights presentation. |

---

## 3. Timeline Surface

| Field | Spec |
|-------|------|
| **Purpose** | Orient “what happened / what matters now.” |
| **Information Priority** | Pins → recent → day groups → detail. |
| **Allowed** | Select event · filter · open read detail. |
| **Forbidden** | Silent renew affordances · emit from timeline. |
| **Cognitive Load** | Sticky days; quiet spine. |
| **Accessibility** | List semantics; announce pins. |
| **Motion** | New event `base`; no auto-scroll while typing. |
| **Responsive** | Full-width river on sm; rail on xl. |
| **Patterns** | Timeline Navigation · Workspace Opening. |
| **COS** | Longitudinal display only (E10 informs). |

---

## 4. AI Dock

| Field | Spec |
|-------|------|
| **Purpose** | Provisional Copilot propose/dispose. |
| **Information Priority** | Provisional label → suggestion → evidence → Dispose actions. |
| **Allowed** | Suggest · Explain · Summarize · Retrieve · Dispose accept/reject/refine/ignore. |
| **Forbidden** | Confirm · Approve-as-HAB · Emit · Persist masters · cover HAB zone. |
| **Cognitive Load** | Docked shelf; stable stream box. |
| **Accessibility** | Announce as suggestion; don’t flood SR. |
| **Motion** | Dock slide `base`–`slow`; no thrash. |
| **Responsive** | Right dock xl; sheet sm. |
| **Patterns** | AI Copilot · Documentation (peripheral). |
| **COS** | E02 disposition only — never E04/E11. |

---

## 5. Human Authority Zone

| Field | Spec |
|-------|------|
| **Purpose** | Explicit physician Confirm/Reject/Modify/Abort for irreversible acts. |
| **Information Priority** | Act summary → identity → consequences → HAB actions → bound status. |
| **Allowed** | Confirm · Reject · Modify · Abort (HAB). |
| **Forbidden** | Copilot Dispose controls · Emit · glass over text · staff reserved acts. |
| **Cognitive Load** | Full attention; one challenge. |
| **Accessibility** | Focus trap; assertive purpose; announce result. |
| **Motion** | Elevation.4 `slow`; no bounce/confetti. |
| **Responsive** | Full-screen sm; band/modal xl. |
| **Patterns** | Human Authority Confirmation. |
| **COS** | E04 HAB presentation — clarity ≫ aesthetics. |

---

## 6. Documentation Surface

| Field | Spec |
|-------|------|
| **Purpose** | Capture clinical narrative (draft/complete). |
| **Information Priority** | Section structure → active field → draft status → AI peripheral. |
| **Allowed** | Edit · save draft · mark complete (if allowed) · accept AI into draft via Dispose. |
| **Forbidden** | Complete = Confirm · Emit from editor · glass over prose. |
| **Cognitive Load** | Comfortable density; long-form focus. |
| **Accessibility** | Labels; headings; save status calm. |
| **Motion** | Minimal; caret stable. |
| **Responsive** | Full-width editor; sticky section nav. |
| **Patterns** | Clinical Documentation · Copilot. |
| **COS** | E06 presentation; finalize irreversible → HAB. |

---

## 7. Orders Surface

| Field | Spec |
|-------|------|
| **Purpose** | Compose/review pre-emit clinical orders. |
| **Information Priority** | Order lines → priority → warnings → actions. |
| **Allowed** | Edit · review · route to HAB when required. |
| **Forbidden** | Protocol apply as Confirm · Emit language · glass. |
| **Cognitive Load** | Group by type. |
| **Accessibility** | Named lists; status text. |
| **Motion** | Expand `fast`. |
| **Responsive** | Stacked cards on sm. |
| **Patterns** | Clinical Order Review. |
| **COS** | E08 pre-emit — not emission. |

---

## 8. Prescription Review Surface

| Field | Spec |
|-------|------|
| **Purpose** | Verify medication intent before HAB/PE. |
| **Information Priority** | Patient ID → med lines (tabular) → warnings → actions. |
| **Allowed** | Review · edit back · proceed to HAB. |
| **Forbidden** | Copilot “Confirm and emit” as one gesture · glass · toast-only critical allergy. |
| **Cognitive Load** | Highlight diffs only. |
| **Accessibility** | Full dose SR text. |
| **Motion** | Static emphasis. |
| **Responsive** | Sticky identity; stacked lines. |
| **Patterns** | Prescription Review · HAB. |
| **COS** | E07/E11 readiness UI — PE sole emit after HAB. |

---

## 9. Telemedicine Surface

| Field | Spec |
|-------|------|
| **Purpose** | Connect calmly; optional clinical side tools. |
| **Information Priority** | Lobby: brand/join/consent · In-call: remote video → controls → clinical sheet. |
| **Allowed** | Join · Leave · Mute · Camera · open clinical sheet. |
| **Forbidden** | Join = Confirm · glass over consent · covering faces with assist by default. |
| **Cognitive Load** | Minimal in-call chrome. |
| **Accessibility** | Control labels; state announced. |
| **Motion** | Lobby liquid OK; in-call minimal. |
| **Responsive** | Full-bleed video sm; side panel xl. |
| **Patterns** | Telemedicine Session. |
| **COS** | E17 modality presentation. |

---

## 10. Dashboard Surface

| Field | Spec |
|-------|------|
| **Purpose** | Orient to next action today. |
| **Information Priority** | Brand → next actions → secondary modules. |
| **Allowed** | Open encounter · agenda · search. |
| **Forbidden** | Stat-hero overload · clinical Confirm. |
| **Cognitive Load** | One focal strip. |
| **Accessibility** | Clear next-action link. |
| **Motion** | Enter `base`. |
| **Responsive** | Vertical stack sm. |
| **Patterns** | Dashboard. |
| **COS** | Assembly only. |

---

## 11. Notification Surface

| Field | Spec |
|-------|------|
| **Purpose** | Awareness without authority. |
| **Information Priority** | Severity → title → time → target. |
| **Allowed** | Open · Ack. |
| **Forbidden** | Ack = Confirm · HAB inside toast alone for critical clinical. |
| **Cognitive Load** | Inbox over spam. |
| **Accessibility** | Live region for critical. |
| **Motion** | Toast `fast`. |
| **Responsive** | Full inbox list sm. |
| **Patterns** | Notification. |
| **COS** | E16 presentation when present. |

---

## 12. Search Surface

| Field | Spec |
|-------|------|
| **Purpose** | Find the right patient/entity with identity confidence. |
| **Information Priority** | Query → identity-rich results → empty. |
| **Allowed** | Search · select → Selection Pattern. |
| **Forbidden** | Auto-select ambiguous sole match when risky. |
| **Cognitive Load** | Highlight matches. |
| **Accessibility** | Combobox; result count. |
| **Motion** | Results `fast`. |
| **Responsive** | Full-screen sheet sm. |
| **Patterns** | Patient Search · Selection. |
| **COS** | Directory read models. |

---

## 13. Empty Surface

| Field | Spec |
|-------|------|
| **Purpose** | Honest absence + one next step. |
| **Information Priority** | Title → sentence → CTA. |
| **Allowed** | Single CTA. |
| **Forbidden** | Fake charts · implying clinical clearance. |
| **Cognitive Load** | Sparse. |
| **Accessibility** | Text first. |
| **Motion** | None required. |
| **Responsive** | Centered block. |
| **Patterns** | Empty State. |
| **COS** | Neutral. |

---

## 14. Error Surface

| Field | Spec |
|-------|------|
| **Purpose** | Recover without losing trust/input. |
| **Information Priority** | What failed → why → what to do. |
| **Allowed** | Retry · edit · support. |
| **Forbidden** | Fake HAB/emit success · infinite spinner. |
| **Cognitive Load** | Inline preferred. |
| **Accessibility** | Associated errors; announce. |
| **Motion** | Brief highlight; no shake loops. |
| **Responsive** | Sticky summary on long forms. |
| **Patterns** | Error Recovery. |
| **COS** | Honest engine errors. |

---

## 15. Offline Surface

| Field | Spec |
|-------|------|
| **Purpose** | State connectivity honestly; block unsafe acts. |
| **Information Priority** | Offline banner → available → blocked → retry. |
| **Allowed** | Retry · read-only if allowed. |
| **Forbidden** | Fake online clinical certainty · HAB/emit when not safe. |
| **Cognitive Load** | Persistent banner. |
| **Accessibility** | Status/alert; announce restore. |
| **Motion** | Static preferred. |
| **Responsive** | Top sticky. |
| **Patterns** | Offline Recovery. |
| **COS** | Reflects availability; does not redefine offline policy engines. |

---

## Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| COS impact | **None** |

**End of HCX Surface Recipes v1.0.**
