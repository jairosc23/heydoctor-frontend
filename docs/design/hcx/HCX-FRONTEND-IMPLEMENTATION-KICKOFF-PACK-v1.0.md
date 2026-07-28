# HCX Frontend Implementation Kickoff Pack v1.0  
## Preparing FE Engineering Under Approved HCX Architecture

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 11 — Frontend Implementation Kickoff Pack |
| **Document** | HCX Frontend Implementation Kickoff Pack |
| **Version** | 1.0 |
| **Status** | Official — **no implementation · no React · no CSS · no Tailwind · no code** |
| **Consumes** | Architecture · Story Matrix · Implementation Contract · Tokens · Patterns · Workflow Scripts |
| **Path** | `docs/design/hcx/HCX-FRONTEND-IMPLEMENTATION-KICKOFF-PACK-v1.0.md` |

**Laws:** Spec only · no commits.  
**Separation:** HCX owns experience. COS owns behavior. Kickoff prepares work; it does not authorize authority shortcuts.

---

## 1. Purpose

Give frontend engineering a **single kickoff pack** to start implementation under approved HCX law: ownership, flags, file map, sequence, validation, a11y, performance, story traceability, COS checkpoints, and rollout — without writing UI code in this phase.

---

## 2. Component ownership

| Family / layer | Owner | Approver for merge |
|----------------|-------|--------------------|
| Primitive / Foundation / Tokens | HCX Foundations | Design System lead |
| Composite shells | HCX + Product Design | HCX lead |
| Clinical: HAB, Assist, Context, Journey | HCX Clinical Experience | FE lead + Clinical Steward (authority paths) |
| Clinical: Docs / Therapy / Orders / Protocol / Longitudinal | HCX Clinical Experience | FE lead |
| Emission readiness UX (E11) | HCX Clinical Experience | FE lead + Clinical Steward |
| Workspace shells | HCX Workspace | FE lead |
| Thin COS API clients | FE Platform | FE lead — **no authority logic** |

**Ownership law:** Clinical components present COS; they never sole-enforce HAB, fail-closed, or emit.

---

## 3. Feature flag strategy

| Flag (conceptual) | Default | Gates | Forbidden use |
|-------------------|---------|-------|---------------|
| `hcx.foundation` | on (dev) | Primitive/Foundation | — |
| `hcx.workspace_shell` | off → soak | WorkspaceShell | Hide unbound banner |
| `hcx.hab_mount` | off → soak | ConfirmationMount | Bypass HAB via flag |
| `hcx.assist_dock` | off | AssistDock | Style Dispose as Confirm |
| `hcx.docs_editor` | off | DocumentationEditor | Emit controls |
| `hcx.therapy_builder` | off | CarePlanBuilder | Fused Ready+Confirm |
| `hcx.orders_builder` | off | OrdersBuilder | External Send |
| `hcx.protocol_panel` | off | ProtocolGuidancePanel | Auto-apply |
| `hcx.longitudinal` | off | TimelineRiver / longitudinal | Renew Rx |
| `hcx.emission_status` | off | Emission readiness UX | Emit without COS E11 |

**Flag laws**

1. Flags hide UX; they must **not** disable backend HAB/context checks.  
2. Emission flag off ⇒ no Emit CTA; never optimistic emit.  
3. Kill-switch must restore fail-closed honesty (unbound/offline still visible).

---

## 4. File ownership map (conceptual paths)

No code created. Intended ownership when implementation begins:

| Path intent | Owner | Stories |
|-------------|-------|---------|
| `design-system/primitive/**` | Foundations | — |
| `design-system/foundation/**` | Foundations | — |
| `composites/**` | HCX | — |
| `clinical/context/**` | Clinical Exp | ST-CTX-*, ST-OFF-* |
| `clinical/hab/**` | Clinical Exp | ST-HAB-* |
| `clinical/assist/**` | Clinical Exp | ST-AI-* |
| `clinical/documentation/**` | Clinical Exp | ST-DOC-* |
| `clinical/therapy/**` | Clinical Exp | ST-THP-* |
| `clinical/orders/**` | Clinical Exp | ST-ORD-* |
| `clinical/protocol/**` | Clinical Exp | ST-PRT-* |
| `clinical/longitudinal/**` | Clinical Exp | ST-TL-* (+ longitudinal) |
| `clinical/emission/**` | Clinical Exp | Emission readiness (post E11 FE) |
| `workspace/**` | Workspace | ST-WS-*, ST-JRN-* |
| `platform/cos-client/**` | FE Platform | API adapters only |

---

## 5. Integration sequence

```text
1. Primitive + Foundation + Tokens wiring
2. WorkspaceShell + ContextBanner + OfflineBanner
3. JourneyStrip (read-only stages)
4. ConfirmationMount (HAB) — before any irreversible CTA
5. AssistDock (Dispose only)
6. DocumentationEditor
7. CarePlanBuilder (PlanReady ≠ Confirm)
8. OrdersBuilder (no Send)
9. ProtocolGuidancePanel (explicit apply)
10. Longitudinal timeline (inform-only)
11. Emission status UX — only after COS E11 PE adapter authorized
```

**Sequence law:** Never ship Emit UX before HAB mount + COS emission pathway readiness.

---

## 6. Validation checklist (FE PR)

- [ ] Story IDs referenced (`ST-*`)  
- [ ] Authority verbs match Communication glossary  
- [ ] No fused Confirm+Emit  
- [ ] Unbound/offline/error honest  
- [ ] HAB focus trap when open  
- [ ] AI labeled suggestion + Dispose only  
- [ ] COS API used for irreversible acts  
- [ ] Tokens only; no forbidden visual themes  
- [ ] Flag does not disable BE authority  
- [ ] Layer import rules respected (Architecture)  

---

## 7. Accessibility verification

| Checkpoint | Method |
|------------|--------|
| HAB open | Keyboard-only open/confirm/abort; focus restore |
| Unbound / offline / critical | Screen reader assertive announcement |
| Assist stream | Polite; suggestion announced |
| Forms (Docs/Therapy/Orders) | Labels, errors associated, tab order |
| Reduced motion | No essential info only in motion |

Map to `HCX-ACCESSIBILITY-STANDARD-v1.0.md` + Story Matrix a11y column.

---

## 8. Performance checkpoints

| Checkpoint | Gate |
|------------|------|
| First clinical paint | Context + work before AI/protocol chunks |
| HAB open | Focus ownership not blocked by streams |
| Draft autosave | Independent of Copilot/Protocol |
| Bundle | Authority paths not behind optional AI chunks |
| Longitudinal | Lazy OK; absence must not block encounter |

---

## 9. Story-to-component traceability

| Story ID | Component family | Kickoff phase |
|----------|------------------|---------------|
| ST-WS-01 | WorkspaceShell | Seq 2 |
| ST-CTX-01/02 | ContextBanner / PatientIdentityChip | Seq 2 |
| ST-OFF-01 | OfflineBanner | Seq 2 |
| ST-JRN-01 | JourneyStrip | Seq 3 |
| ST-HAB-01/02 | ConfirmationMount / AuthorityVerbCluster | Seq 4 |
| ST-AI-01/02 | AssistDock / DispositionActions | Seq 5 |
| ST-DOC-01/02 | DocumentationEditor / Complete CTA | Seq 6 |
| ST-THP-01…03 | CarePlanBuilder / Ready / Handoff | Seq 7 |
| ST-ORD-01…04 | OrdersBuilder / Ready / Handoff / Rx guard | Seq 8 |
| ST-PRT-01…04 | ProtocolGuidancePanel / Apply / Dismiss / Conflict | Seq 9 |
| ST-TL-01 | TimelineRiver | Seq 10 |
| ST-NTF/ERR/EMP | Notification / Error / Empty | Parallel with seq 2+ |

Full inventory: `HCX-STORY-MATRIX-v1.0.md`.

---

## 10. COS integration checkpoints

| COS | FE checkpoint before ship |
|-----|---------------------------|
| E05 | Unbound blocks irreversible CTAs |
| E04 | Only HAB mount submits Confirm |
| E02 | Dispose API only from Assist |
| E06–E08 | Draft/Ready/handoff APIs; no emit |
| E09 | Apply/dismiss only; no authorize |
| E10 | Timeline inform-only; no renew |
| E11 | Emit CTA only via emission-pipeline; HAB required; PE sole meds |

**Authority rule:** Backend remains SSOT. Frontend never invents Confirm/Emit success.

---

## 11. Rollout strategy

| Stage | Scope | Exit |
|-------|-------|------|
| **R0 Internal** | Foundation + Workspace + Context | Visual QA + a11y smoke |
| **R1 Authority** | HAB + Assist | Steward review of verbs |
| **R2 Clinical builders** | Docs/Therapy/Orders (+ flags) | Story Matrix green for ST-DOC/THP/ORD |
| **R3 Advisory + longitudinal** | Protocol + Timeline | No auto-apply/renew |
| **R4 Emission UX** | Emission status after COS PE adapter GO | No alternate emit UI |

Rollback: disable feature flag; never leave fused Confirm+Emit behind.

---

## 12. Recommended next phase

**HCX Phase 12 — Foundation Implementation Wave** (Primitive/Foundation only, behind `hcx.foundation`, Storybook stories ST-WS/CTX smoke) **after explicit PO authorization to write code**.

---

## Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| Commits required | **None** |

**End of HCX Frontend Implementation Kickoff Pack v1.0.**
