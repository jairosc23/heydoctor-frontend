# Architecture baseline

**Registered:** 2026-08-24  
**Branch:** `feat/phase-19a-clinical-workspace-closure`

## Official domains

| Domain | Kind | Official identity |
|--------|------|-------------------|
| Encounter | Write (existing Encounter lifecycle) | `EncounterId` |
| Clinical Completion | Write (clinical act close) | `ClinicalActId` |
| Commercial Settlement | Write (commercial close) | `SettlementId` |
| Clinical Operations | Read-only projection | none (keyed by `EncounterId`) |
| RC-19A Stabilization | Certified workspace chrome | — |
| Auth | Platform | — |
| Workspace | Platform | — |
| Clinical Foundation | Platform | — |
| Branding | Platform | — |
| WebRTC | Platform | — |

Observability is not a product domain. `CorrelationId` is tracing only.

## Official identities

| Identity | Domain | Role |
|----------|--------|------|
| `EncounterId` | Encounter | Canonical identity of one Encounter (`consultation.id`) |
| `ClinicalActId` | Clinical Completion | Canonical identity of one clinical act |
| `SettlementId` | Commercial Settlement | Canonical identity of one commercial settlement. Bound to exactly one Encounter |
| `CorrelationId` | Observability | Tracing only. Never a business identity |

Do not invent a fifth business identity. `ClinicalActId` ≠ `SettlementId` ≠ `EncounterId` ≠ `CorrelationId`.

## Certified baselines

| Domain | Status | Baseline | Identity / SHA |
|--------|--------|----------|----------------|
| RC-19A Stabilization Sprint 1 | CERTIFIED | `docs/RC-19A_SPRINT_1_CERTIFIED_BASELINE.md` | `ef1d7d5cba5c6cc933287e30e9c76b125271443a` |
| RC-19A Stabilization Sprint 2 | CERTIFIED | `docs/RC-19A_SPRINT_2_CERTIFIED_BASELINE.md` | `0e512bef339acea3c67a11f4722ed132f0ae00e5` |
| RC-19A program status | CERTIFIED / frozen | `docs/RC-19A_CERTIFIED_STATUS.md` | — |
| Clinical Completion Workflow | CERTIFIED | `docs/CLINICAL_COMPLETION_CERTIFIED_BASELINE.md` | `7fcac05562174201b21c205a05b73f35b84f055d` (`ClinicalActId`) |
| Commercial Settlement Workflow | CERTIFIED | `docs/COMMERCIAL_SETTLEMENT_CERTIFIED_BASELINE.md` | `SettlementId` |
| Clinical Operations Projection | CERTIFIED | `docs/CLINICAL_OPERATIONS_CERTIFIED_BASELINE.md` | Projection; no owned identity |

Encounter states remain: `draft → in_progress → completed → signed → locked`.

## Domain dependencies

```
Encounter
    ├── Clinical Completion   (reads Encounter; does not write Encounter status)
    ├── Commercial Settlement (reads Encounter; observes signed → locked; does not write Clinical Completion)
    └── Clinical Operations   (reads Encounter + Completion + Settlement; writes nothing)
```

- Clinical Completion and Commercial Settlement are independent of each other.
- Clinical Operations depends on all three as read sources only.
- RC-19A, Auth, Workspace, Foundation, Branding, and WebRTC have no write dependency from Completion, Settlement, or COD.

## Write rules

A domain may write only its own records.

| Domain | May write | Must not write |
|--------|-----------|----------------|
| Encounter | Encounter lifecycle (`draft → … → locked`) | ClinicalAct, Settlement, COD view |
| Clinical Completion | Completion snapshot / `ClinicalActId` | Encounter status, Settlement, COD view |
| Commercial Settlement | Settlement snapshot / `SettlementId` | Encounter status, Clinical Completion, COD view |
| Clinical Operations | nothing | everything |
| RC-19A / Auth / Workspace / Foundation / Branding / WebRTC | their own certified surfaces only, and only with a new incident + authorization | product domains above |

Writes to a certified domain require: independent incident, explicit authorization, new certification.

## Read-only rules

| Reader | May read | Must not |
|--------|----------|----------|
| Clinical Operations | Encounter, Completion snapshot, Settlement snapshot, certified audits | `run*` / `ensure*` / `observe*` / `initiate*` / `persist*` / `save*`; Browser, Session, LocalStorage, or clock to change the projection |
| Clinical Completion | Encounter (status as mirror) | Settlement store |
| Commercial Settlement | Encounter, Payku / invoice APIs | Completion store |
| Any UI / chrome | certified public read APIs of its domain | mutate another certified domain |

A missing Completion or Settlement is `absent`. Readers must not mint `ClinicalActId` or `SettlementId` to fill a gap.

`ClinicalOperationsView` is one logical instant (`asOf`). It is a projection, not a source of truth.

## Frozen components

Do not modify without an independent incident, explicit authorization, and a new certification.

**RC-19A Sprint 1**  
`PanelLayout.tsx`, `lib/unsaved-changes-guard/**`, `components/unsaved-changes/**`, `ShareConsultationDialog.tsx`, `ClinicalBetaFeedbackWidget.tsx`, `lib/clinical-overlay-contract.ts`, D1/D17/D18/D19 wiring in `app/panel/consultas/[id]/page.tsx`, `lib/encounter/sprint-1-p0.test.ts`

**RC-19A Sprint 2**  
`app/panel/consultas/page.tsx`, `GlobalWhatsAppFab.tsx`, `lib/whatsapp-fab-visibility.ts`, `ClinicalCopilotDrawer.tsx`, `lib/clinical-workspace/visual-surfaces.ts`, Continuity dedupe, `ContinuityPanelShell.tsx`, `EncounterActionMenu.tsx`  
D9 remains out of scope (`ShareConsultationDialog` freeze).

**Clinical Completion**  
`lib/clinical-completion/**`, `lib/emission-pipeline/api.ts`, `ClinicalCompletionSection.tsx`, Clinical Completion mount in `EncounterClosureSection.tsx`

**Commercial Settlement**  
`lib/commercial-settlement/**`, `CommercialSettlementSection.tsx`, Commercial Settlement mount in `EncounterClosureSection.tsx`

**Clinical Operations**  
`lib/clinical-operations/**`

**Platform (do not reopen)**  
Auth, Workspace chrome, Clinical Foundation, Branding, WebRTC, patient portal
