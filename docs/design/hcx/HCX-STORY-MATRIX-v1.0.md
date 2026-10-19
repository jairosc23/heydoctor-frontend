# HCX Story Matrix v1.0  
## Story Inventory · Variants · States · Accessibility Mapping

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 10 — Component Architecture & Story Matrix |
| **Document** | HCX Story Matrix |
| **Version** | 1.0 |
| **Status** | Official — **no implementation · no React · no CSS · no Tailwind · no code** |
| **Consumes** | Component Architecture · Patterns · Workflow Scripts · Communication · Accessibility Standard |
| **Path** | `docs/design/hcx/HCX-STORY-MATRIX-v1.0.md` |

**Laws:** Spec only · no commits. Stories define acceptance before code.

---

## 1. Purpose

Provide the **canonical story inventory** for HCX Clinical and Workspace components: variants, states, accessibility expectations, and COS boundary notes — so FE/QA can author Storybook/acceptance cases without inventing authority semantics.

---

## 2. Legend

| Column | Meaning |
|--------|---------|
| **Story ID** | Stable identifier |
| **Component family** | Architecture layer family |
| **Variants** | Structural variants |
| **States** | Required interactive/system states |
| **A11y** | Accessibility obligation |
| **COS** | COS boundary note |

---

## 3. Story inventory

### 3.1 Workspace & Context

| Story ID | Component family | Variants | States | A11y | COS |
|----------|------------------|----------|--------|------|-----|
| ST-WS-01 | WorkspaceShell | xl / sm | idle, loading, degraded | Landmark regions | Host only |
| ST-CTX-01 | ContextBanner | bound / unbound | bound, unbound, rebinding | Assertive on unbound | E05 display |
| ST-CTX-02 | PatientIdentityChip | compact / full | matched, mismatch warning | Name+ID announced | Never silent switch |
| ST-OFF-01 | OfflineBanner | sticky | online, offline, reconnecting | Assertive | Fail-closed UX |

### 3.2 Journey & Timeline

| Story ID | Component family | Variants | States | A11y | COS |
|----------|------------------|----------|--------|------|-----|
| ST-JRN-01 | JourneyStrip | explore/assist/compose/confirm | legal stages only | Current stage announced | E03 ≠ authority |
| ST-TL-01 | TimelineRiver | dense / calm | empty, populated, loading | Keyboard scroll | No Confirm/Emit |

### 3.3 Human Authority (HAB)

| Story ID | Component family | Variants | States | A11y | COS |
|----------|------------------|----------|--------|------|-----|
| ST-HAB-01 | ConfirmationMount | modal / band | closed, open, submitting, confirmed, rejected, aborted | Focus trap; assertive; Escape=Abort | E04 only |
| ST-HAB-02 | AuthorityVerbCluster | four verbs | enabled, disabled per COS | Verb names from glossary | Confirm ≠ Emit |

### 3.4 AI Copilot / Disposition

| Story ID | Component family | Variants | States | A11y | COS |
|----------|------------------|----------|--------|------|-----|
| ST-AI-01 | AssistDock | dock / sheet | collapsed, open, streaming, error | Polite stream; suggestion label | Dispose only |
| ST-AI-02 | DispositionActions | accept/reject/refine/ignore | idle, pending, failed | Each verb distinct | Dispose ≠ Confirm |

### 3.5 Documentation (E06)

| Story ID | Component family | Variants | States | A11y | COS |
|----------|------------------|----------|--------|------|-----|
| ST-DOC-01 | DocumentationEditor | sections / narrative | drafting, draft_saved, ready, completed, discarded | Autosave status polite | No emit |
| ST-DOC-02 | DocumentationCompleteCTA | primary | disabled until ready; opens HAB path | Distinct from Save | Complete ≠ Emit |

### 3.6 Therapy (E07)

| Story ID | Component family | Variants | States | A11y | COS |
|----------|------------------|----------|--------|------|-----|
| ST-THP-01 | CarePlanBuilder | items list | drafting, draft_saved, plan_ready, handoff, closed | Item add/remove keyboard | Plan ≠ Ready ≠ Confirm ≠ Emit |
| ST-THP-02 | PlanReadyCTA | secondary | enabled when valid | Not Confirm chrome | Ready ≠ Confirm |
| ST-THP-03 | TherapyHandoffCTA | tertiary | after PlanReady | Separate from Confirm | Handoff ≠ Confirm |

### 3.7 Clinical Orders (E08)

| Story ID | Component family | Variants | States | A11y | COS |
|----------|------------------|----------|--------|------|-----|
| ST-ORD-01 | OrdersBuilder | lab/imaging/procedure/referral | drafting → prepared → ready → handoff | Kind announced | Pre-emit only |
| ST-ORD-02 | OrderReadyCTA | secondary | blocked when validation fails | Error text | Ready ≠ Confirm ≠ Dispatch |
| ST-ORD-03 | OrderHandoffCTA | tertiary | after OrderReady | Separate control | No external Send |
| ST-ORD-04 | ForbiddenRxGuard | — | medication attempt rejected | Error explained | INT-FORBID-RX |

### 3.8 Protocol Engine (E09)

| Story ID | Component family | Variants | States | A11y | COS |
|----------|------------------|----------|--------|------|-----|
| ST-PRT-01 | ProtocolGuidancePanel | dock / panel | none, loading, available, conflict, expired | Provisional tone | Advisory only |
| ST-PRT-02 | ProtocolApplyAction | per target | apply to docs/therapy/orders/copilot | Explicit gesture | Apply ≠ Ready |
| ST-PRT-03 | ProtocolDismissAction | — | dismissible without penalty | First-class ignore | Never forces care |
| ST-PRT-04 | ProtocolConflictNotice | disclosure | multi-protocol | Announced | No auto-merge |

### 3.9 Notifications & Errors

| Story ID | Component family | Variants | States | A11y | COS |
|----------|------------------|----------|--------|------|-----|
| ST-NTF-01 | NotificationInbox | list | empty, unread, critical | Critical not toast-only | Ack ≠ Confirm |
| ST-ERR-01 | ClinicalErrorState | inline / page | recoverable, fatal | Text + recovery CTA | Honest fail-closed |
| ST-EMP-01 | ClinicalEmptyState | per surface | first-use, no-data | Guidance without fake data | — |

### 3.10 Scheduling & Telemedicine (presentation)

| Story ID | Component family | Variants | States | A11y | COS |
|----------|------------------|----------|--------|------|-----|
| ST-SCH-01 | ScheduleBookControl | — | book success | — | Book ≠ Confirm |
| ST-TEL-01 | ConnectionTruthBanner | — | connecting, connected, degraded, failed | Assertive on fail | Join ≠ Confirm |

---

## 4. Variant matrix (cross-cutting)

| Variant axis | Values | Applies to |
|--------------|--------|------------|
| Density | calm / staff-dense | Workspace, tables, admin |
| Breakpoint | xl / sm | All Workspace shells |
| Locale | glossary-locked verbs | HAB, Dispose, Ready/Confirm/Emit labels |
| Reduced motion | instant / opacity | Dock, HAB elevation |
| Role | physician / staff / admin | Visibility of HAB vs prep |

---

## 5. State matrix (authority-critical)

| State family | Allowed transitions (UX) | Forbidden UX |
|--------------|--------------------------|--------------|
| Draft → Ready | Explicit Ready CTA | Auto-Ready from AI/Protocol |
| Ready → HAB | Explicit handoff/open HAB | Ready button that Confirms |
| HAB → Emit | Separate Emit after Confirm (E11) | Fused Confirm+Emit |
| Protocol → Draft | Explicit Apply seed | Apply & Prescribe/Send |
| Unbound | Block irreversible CTAs | Optimistic Confirm |

---

## 6. Accessibility mapping (summary)

| Story families | Required a11y |
|----------------|---------------|
| ST-HAB-* | Focus trap, assertive live region, Escape semantics |
| ST-AI-* | Suggestion labeling, throttled stream |
| ST-CTX-*, ST-OFF-*, ST-ERR-* | Assertive system truth |
| ST-DOC/THP/ORD/PRT | Keyboard complete; status polite; errors associated |

Full AA rules: `HCX-ACCESSIBILITY-STANDARD-v1.0.md`.

---

## 7. COS integration boundaries (story-level)

Every story with COS column **display/invoke** must document in FE acceptance:

1. Which COS API is called (if any)  
2. Which authority verb is **not** implied  
3. Fail-closed behaviour when API/context denies  

Stories must never invent local Confirm/Emit success without COS acknowledgement.

---

## 8. Performance expectations (stories)

| Story | Performance note |
|-------|------------------|
| ST-WS-01 / ST-CTX-01 | First paint priority |
| ST-HAB-01 | Instant focus ownership |
| ST-AI-01 / ST-PRT-01 | Deferrable; must not block HAB/Docs |
| ST-DOC-01 autosave | Debounced; independent of AI |

---

## 9. Versioning strategy

| Matrix change | Bump |
|---------------|------|
| Add story for existing family | Minor |
| Change authority state semantics | Requires COS + Architecture major/PO |
| Remove forbidden path | Patch (tightening) |

FE Storybook titles SHOULD use Story IDs (`ST-HAB-01`, …).

---

## 10. Forbidden story compositions

Do not author stories that demonstrate:

- ConfirmAndEmit  
- ProtocolApplyAndSend  
- AI Accept as Confirm  
- OrderReady as external Send  
- Staff HAB Confirm  

---

## 11. Recommended next phase

**HCX Phase 11 — FE Implementation Kickoff Pack** (story → file ownership map, flag plan, acceptance harness) **or** PO-authorized implementation of Primitive/Foundation only under Architecture + this matrix.

---

## Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| Commits required | **None** |

**End of HCX Story Matrix v1.0.**
