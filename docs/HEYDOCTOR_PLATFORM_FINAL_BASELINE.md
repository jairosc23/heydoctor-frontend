# HeyDoctor Platform — final baseline

**Registered:** 2026-08-25  
**Type:** official close of Platform Phase + Business Applications Phase  
**Branch:** `feat/phase-19a-clinical-workspace-closure`  
**HEAD at certification:** `6d6ec01cd9cb14af9bee9748a211167a11f3c636`

This document does not modify CORE_PLATFORM, ARCHITECTURE_BASELINE, PRODUCT_PLATFORM v6.0, or BUSINESS_APPLICATIONS_EPIC_1.

---

## 1. CORE PLATFORM (LTS)

**Status:** CERTIFIED · **Long-Term Stable**

Catalog: `docs/CORE_PLATFORM.md`

New product or business work **consumes** Core. It does not modify it.

Writes to Core require: independent incident, explicit authorization, new certification.

---

## 2. PRODUCT PLATFORM v6.0 (LTS)

**Status:** CERTIFIED · **Long-Term Stable** · frozen through v6.0

Catalog: `docs/PRODUCT_PLATFORM_BASELINE.md`

Product Platform is separate from Core. Epics v1.0–v6.0 consume Core and do not write it.

There is no Product Platform v7.0.

| Version | Epic | Status |
|---------|------|--------|
| v1.0 | Clinical Delivery Queue | CERTIFIED / frozen |
| v2.0 | Revenue Integrity Dashboard | CERTIFIED / frozen |
| v3.0 | Longitudinal Patient Continuity | CERTIFIED / frozen |
| v4.0 | Pre-Visit Clinical Brief | CERTIFIED / frozen |
| v5.0 | Operational Pulse Dashboard | CERTIFIED / frozen |
| v6.0 | Patient Portal | CERTIFIED / frozen |
| — | Epic 7 — Intelligent Patient Follow-up | **REJECTED BY ARCHITECTURE** |

---

## 3. BUSINESS APPLICATIONS (COMPLETE)

**Status:** **COMPLETE**

Evidence: `docs/BUSINESS_APPLICATIONS_GAP_ANALYSIS.md`

| Item | Status |
|------|--------|
| Epic 1 — Digital Clinic (BA-CD-1) | CERTIFIED |
| Epic 2 — Medical Director Console | **REJECTED BY ARCHITECTURE** |
| Consume-only Epics beyond Epic 1 | **none** |

Digital Clinic is a **business process layer**. It is not Product Platform v7.0. It does not own identities. It orchestrates navigation to LTS URLs and does not write Core.

Baseline: `docs/BUSINESS_APPLICATIONS_EPIC_1_DIGITAL_CLINIC_CERTIFIED_BASELINE.md`

Processes (exactly four): Atención, Caja por Encounter, Dirección Médica, Operaciones.

**BUSINESS APPLICATIONS PHASE COMPLETE.**

No further consume-only Epic is justified on the current architecture.

---

## 4. Baselines certificadas

| Domain / Epic | Status | Baseline |
|---------------|--------|----------|
| Architecture | FROZEN | `docs/ARCHITECTURE_BASELINE.md` |
| Core Platform | LTS | `docs/CORE_PLATFORM.md` |
| RC-19A Sprint 1 | CERTIFIED | `docs/RC-19A_SPRINT_1_CERTIFIED_BASELINE.md` · SHA `ef1d7d5cba5c6cc933287e30e9c76b125271443a` |
| RC-19A Sprint 2 | CERTIFIED | `docs/RC-19A_SPRINT_2_CERTIFIED_BASELINE.md` · SHA `0e512bef339acea3c67a11f4722ed132f0ae00e5` |
| RC-19A program | CERTIFIED / frozen | `docs/RC-19A_CERTIFIED_STATUS.md` |
| Clinical Completion | CERTIFIED | `docs/CLINICAL_COMPLETION_CERTIFIED_BASELINE.md` · SHA `7fcac05562174201b21c205a05b73f35b84f055d` |
| Commercial Settlement | CERTIFIED | `docs/COMMERCIAL_SETTLEMENT_CERTIFIED_BASELINE.md` |
| Clinical Operations | CERTIFIED | `docs/CLINICAL_OPERATIONS_CERTIFIED_BASELINE.md` |
| Patient Care Continuity | CERTIFIED | `docs/PATIENT_CARE_CONTINUITY_CERTIFIED_BASELINE.md` |
| Product Platform v6.0 | LTS | `docs/PRODUCT_PLATFORM_BASELINE.md` |
| Product v1.0 | CERTIFIED / frozen | `docs/EPIC_CLINICAL_DELIVERY_QUEUE.md` |
| Product v2.0 | CERTIFIED / frozen | `docs/EPIC_2_REVENUE_INTEGRITY_CERTIFIED_BASELINE.md` |
| Product v3.0 | CERTIFIED / frozen | `docs/EPIC_3_LONGITUDINAL_CONTINUITY_CERTIFIED_BASELINE.md` |
| Product v4.0 | CERTIFIED / frozen | `docs/EPIC_4_PRE_VISIT_CLINICAL_BRIEF_CERTIFIED_BASELINE.md` |
| Product v5.0 | CERTIFIED / frozen | `docs/EPIC_5_OPERATIONAL_PULSE_CERTIFIED_BASELINE.md` |
| Product v6.0 | CERTIFIED / frozen | `docs/EPIC_6_PATIENT_PORTAL_CERTIFIED_BASELINE.md` |
| BA Epic 1 Digital Clinic | CERTIFIED | `docs/BUSINESS_APPLICATIONS_EPIC_1_DIGITAL_CLINIC_CERTIFIED_BASELINE.md` |
| Product Epic 7 | REJECTED | `docs/EPIC_7_INTELLIGENT_PATIENT_FOLLOW_UP_FUNCTIONAL_ANALYSIS.md` |
| BA Epic 2 | REJECTED | `docs/BUSINESS_APPLICATIONS_EPIC_2_MEDICAL_DIRECTOR_CONSOLE_FUNCTIONAL_ANALYSIS.md` |
| BA gap analysis | COMPLETE | `docs/BUSINESS_APPLICATIONS_GAP_ANALYSIS.md` |

Auth, Workspace, Clinical Foundation, Branding, WebRTC, agenda, and the legacy patient portal are **platform freeze** under Core / RC-19A. They are not product write domains. They are not reopened.

---

## 5. Dominios oficiales

| Domain | Kind | Official identity |
|--------|------|-------------------|
| Encounter | Write (existing lifecycle) | `EncounterId` |
| Clinical Completion | Write (clinical act close) | `ClinicalActId` |
| Commercial Settlement | Write (commercial close) | `SettlementId` |
| Clinical Operations | Read-only projection | none (keyed by `EncounterId`) |
| Patient Care Continuity | Ephemeral projection | none (keyed by `EncounterId`; current `ClinicalActId` only) |
| RC-19A Stabilization | Certified workspace chrome | — |
| Auth | Platform | — |
| Workspace | Platform | — |
| Clinical Foundation | Platform | — |
| Branding | Platform | — |
| WebRTC | Platform | — |
| Product Platform v1.0–v6.0 | Consume-only product | none (reuse Core identities) |
| Digital Clinic | Business process layer | none (`writes: false`) |

Observability is not a product domain.

No incomplete official domain. No fifth product domain.

---

## 6. Identidades oficiales

| Identity | Domain | Role |
|----------|--------|------|
| `EncounterId` | Encounter | Canonical identity of one Encounter (`consultation.id`) |
| `ClinicalActId` | Clinical Completion | Canonical identity of one clinical act |
| `SettlementId` | Commercial Settlement | Canonical identity of one commercial settlement. Bound to exactly one Encounter |
| `CorrelationId` | Observability | Tracing only. Never a business identity |

`ClinicalActId` ≠ `SettlementId` ≠ `EncounterId` ≠ `CorrelationId`.

Do not invent a fifth business identity.

`patientId` is an aggregation filter used by Product v3.0/v4.0, not an official identity.  
`appointment id` of the legacy agenda coexists with `EncounterId`; they are not unified.

No pending official identity.

---

## 7. Componentes congelados

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

**Patient Care Continuity**  
`lib/patient-care-continuity/**`

**Product Platform**  
`lib/product-platform/clinical-delivery-queue/**` · `app/panel/entrega-clinica/page.tsx`  
`lib/product-platform/revenue-integrity/**` · `app/panel/integridad-ingresos/page.tsx`  
`lib/product-platform/longitudinal-continuity/**` · `app/panel/continuidad-longitudinal/[patientId]/page.tsx`  
`lib/product-platform/pre-visit-clinical-brief/**` · `app/panel/brief-previsita/[patientId]/page.tsx`  
`lib/product-platform/operational-pulse/**` · `app/panel/pulso-operativo/page.tsx`  
`lib/product-platform/patient-portal/**` · `app/portal/(app)/encounter/[encounterId]/page.tsx`

**Business Applications Epic 1**  
`lib/business-applications/digital-clinic/**`

**Platform (do not reopen)**  
Auth, Workspace chrome, Clinical Foundation, Branding, WebRTC, legacy patient portal, agenda.

---

## 8. Workflows oficiales

| Workflow | Owner | States | Status |
|----------|-------|--------|--------|
| Encounter lifecycle | Encounter | `draft → in_progress → completed → signed → locked` | LTS |
| Clinical Completion | Clinical Completion | `pending → emitted \| no_medication → document_ready → delivered` | CERTIFIED |
| Commercial Settlement | Commercial Settlement | `pending → payment_initiated → payment_verified → invoiced → locked` | CERTIFIED |

Clinical Operations is a read-only projection (`ClinicalOperationsView`, one `asOf`). It is not a workflow.  
Patient Care Continuity is an ephemeral `ContinuityPackage`. It is not a workflow.  
Product v1.0–v6.0 do not write Core (`No Writes`).  
Digital Clinic processes have `writes: false`.

Completion and Settlement are independent of each other. Neither writes Encounter status as owner of the other domain.

No uncertified official workflow.

---

## 9. Estado final de la arquitectura

```
Encounter
    ├── Clinical Completion        (reads Encounter; does not write Encounter status)
    ├── Commercial Settlement      (reads Encounter; observes signed → locked; does not write Clinical Completion)
    └── Clinical Operations        (reads Encounter + Completion + Settlement; writes nothing)
            └── Patient Care Continuity (reads ClinicalOperationsView; writes nothing)

Product Platform v1.0–v6.0     consume Core (read-only)
Digital Clinic (BA Epic 1)     consumes Core + Product (navigation only; writes: false)
```

- No circular dependency.
- A missing Completion or Settlement is `absent`. Readers must not mint `ClinicalActId` or `SettlementId`.
- `ClinicalOperationsView` and `ContinuityPackage` are not sources of truth.
- Architecture Baseline remains FROZEN. Core Platform is the complete LTS domain catalog (includes Patient Care Continuity).

| Check | Result |
|-------|--------|
| Architectural vacuum | PASS |
| Incomplete official domain | PASS |
| Pending certified baseline | PASS |
| Uncertified official workflow | PASS |
| Pending official identity | PASS |
| Circular dependency | PASS |
| Frozen component without baseline or platform freeze | PASS |
| Open Epic | PASS (none) |

---

## 10. Roadmap cerrado

| Phase | Status |
|-------|--------|
| Platform Phase | CLOSED |
| CORE_PLATFORM | LTS |
| PRODUCT_PLATFORM v6.0 | LTS |
| Product Epic 7 | REJECTED BY ARCHITECTURE |
| Business Applications Phase | COMPLETE |
| Business Applications Epic 1 | CERTIFIED |
| Business Applications Epic 2 | REJECTED BY ARCHITECTURE |
| Further consume-only Epics | none |

No deploy. No merge. No new phase.

Further work proceeds only by **independent incident**, **explicit authorization**, and **new certification**. That path is not a consume-only Epic on this architecture.
