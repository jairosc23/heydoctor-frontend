# HCX Component Architecture v1.0  
## Canonical Frontend Component Architecture (Pre-Implementation)

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 10 — Component Architecture & Story Matrix |
| **Document** | HCX Component Architecture |
| **Version** | 1.0 |
| **Status** | Official — **no implementation · no React · no CSS · no Tailwind · no code** |
| **Consumes** | Taxonomy · Tokens · Patterns · Blueprints · Surfaces · Wireframes · Implementation Contract · Workflow Scripts |
| **Path** | `docs/design/hcx/HCX-COMPONENT-ARCHITECTURE-v1.0.md` |

**Laws:** Spec only · no commits.  
**Separation:** HCX owns experience composition. COS owns clinical behavior.

---

## 1. Purpose

Define the **canonical component architecture** that frontend engineering must follow before writing UI code — hierarchy, ownership, composition, reuse, COS boundaries, forbidden compositions, performance, and versioning.

Companion: `HCX-STORY-MATRIX-v1.0.md`.

---

## 2. Component hierarchy (canonical)

```
Primitive
  → Foundation
    → Composite
      → Clinical
        → Workspace
          → Experience (role / workflow shells)
```

| Layer | Meaning | May know COS? |
|-------|---------|---------------|
| Primitive | Atoms, no product meaning | No |
| Foundation | Shared controls & shells | No |
| Composite | Multi-control assemblies | No clinical authority |
| Clinical | Clinical semantics presentation | Read/display COS states only |
| Workspace | Mount / zone layouts (E01) | Hosts Clinical; never sole authority |
| Experience | Role playbooks & workflow shells | Orchestrates presentation only |

**Import rule:** Higher may compose lower. Lower must never import Clinical/Workspace/Experience.

---

## 3. Ownership

| Layer / family | Owner | Change authority |
|----------------|-------|------------------|
| Primitive / Foundation / Tokens | HCX Foundations | Design System lead |
| Composite | HCX + Product Design | HCX minor |
| Clinical (HAB, Copilot, Docs, Therapy, Orders, Protocol, Timeline) | HCX Clinical Experience | Requires Implementation Contract compliance |
| Workspace mounts | HCX Workspace | Must not redefine COS |
| COS API adapters / clients | FE Platform (thin) | Must not invent authority |

**Ownership law:** Clinical components **present** COS; they do not own HAB, fail-closed, or emit.

---

## 4. Composition rules

1. **One authority mount:** HAB Confirmation Mount is the only Confirm surface for irreversible acts.  
2. **One AI dock:** Copilot/Assist is the only Dispose surface for provisional AI.  
3. **One primary CTA per mode:** Workspace mode defines the primary action; secondary actions demote.  
4. **Context banner always above work:** Unbound/offline must remain visible while editing.  
5. **Protocol guidance is advisory chrome:** Never fuse Apply + Ready/Confirm/Emit.  
6. **Orders builder has no Send:** Pre-emit only until E11/dispatch epic.  
7. **Story-driven variants:** Every Clinical component declares states from Story Matrix before code.

---

## 5. Reuse strategy

| Prefer | Avoid |
|--------|-------|
| Shared Foundation Button / Banner / Modal shell | One-off clinical buttons with custom chrome |
| Shared Empty / Error / Offline recipes | Per-feature offline inventiveness |
| Shared FocusTrap + live region utilities | HAB-only custom focus hacks that diverge |
| Tokenized spacing/type | Hard-coded clinical hex outside tokens |
| Surface Recipes as composition recipes | Parallel “v2 clinical kit” |

**Reuse law:** If two Clinical screens need the same chrome, promote to Composite or Clinical shared — never copy-paste authority verbs.

---

## 6. COS integration boundaries

| COS epic | Clinical component family | FE may | FE must not |
|----------|---------------------------|--------|-------------|
| E05 Context | ContextBanner / BindingChip | Show bound/unbound | Sole-decide binding |
| E04 HAB | ConfirmationMount | Submit Confirm via COS API | Client-only Confirm |
| E02 Disposition | AssistDock Dispose actions | Call Dispose API | Style Dispose as Confirm |
| E03 Journey | JourneyStrip | Reflect stages | Stage ≠ authority |
| E06 Docs | DocumentationEditor | Draft/complete APIs | Emit |
| E07 Therapy | CarePlanBuilder | PlanReady/handoff APIs | Confirm/Emit fusion |
| E08 Orders | OrdersBuilder | Ready/handoff APIs | External send / Rx |
| E09 Protocol | ProtocolGuidancePanel | Evaluate/apply/dismiss | Authorize / auto-Ready |
| E11 Emit (future) | EmissionControl (later) | Separate after HAB | Live inside E06–E09 |

---

## 7. Accessibility mapping

| Concern | Architecture obligation |
|---------|-------------------------|
| HAB open | Focus trap + assertive live region owned by ConfirmationMount |
| AI streaming | Throttled polite announcements; labeled suggestion |
| Critical / unbound / offline | Text + live region; never color-only |
| Keyboard | All primary clinical actions in tab order without pointer |
| Locale | Authority verbs from Communication System glossary |

Detail stories: see Story Matrix a11y column.

---

## 8. Performance expectations

| Path | Expectation |
|------|-------------|
| Context + primary work surface | Paint before heavy AI / protocol panels |
| HAB open | Focus ownership immediate; not blocked by Copilot stream |
| Draft autosave | Independent of protocol/AI chunk load |
| Code splitting | Authority paths (HAB, fail-closed) not behind optional AI chunks |
| Protocol panel | Lazy OK; absence must not block Docs/Therapy/Orders |

---

## 9. Versioning strategy

| Change | Version bump |
|--------|--------------|
| Token / copy / non-authority chrome | HCX patch |
| New Clinical family mapped to existing COS | HCX minor + Story Matrix update |
| New authority verb or fused CTA | **Forbidden in HCX alone** — COS/PO |
| Layer import rule break | HCX major |

FE packages declare which Architecture + Story Matrix versions they implement.

---

## 10. Forbidden compositions

1. Confirm + Emit fused control  
2. AI Dispose verbs labeled as HAB Confirm  
3. Protocol Apply + Prescribe / Send  
4. PlanReady or OrderReady styled as Confirm  
5. Documentation Complete triggering emit  
6. Staff chrome offering clinical HAB  
7. Timeline event buttons that Confirm/Emit  
8. LocalStorage as authority evidence  
9. Optimistic irreversible write without COS ack  
10. Clinical layer importing Primitive-breaking raw DOM authority hacks  
11. Parallel mini-COS store in the browser  
12. Purple “AI magic” system competing with brand teal truth  

---

## 11. Relationship to Implementation Contract

This Architecture **specializes** `HCX-FRONTEND-IMPLEMENTATION-CONTRACT-v1.0.md` into component-layer law.  
Story Matrix enumerates acceptance stories.  
Neither document authorizes React/CSS implementation.

---

## Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| Commits required | **None** |

**End of HCX Component Architecture v1.0.**
