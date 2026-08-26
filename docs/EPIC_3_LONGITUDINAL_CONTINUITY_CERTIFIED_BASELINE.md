# Epic 3 — Longitudinal Patient Continuity — certified baseline

**Status:** CERTIFIED  
**Frozen:** 2026-08-24  
**Product Platform:** v3.0  
**Epic:** Longitudinal Patient Continuity  
**Branch:** `feat/phase-19a-clinical-workspace-closure`  
**HEAD at certification:** `6d6ec01cd9cb14af9bee9748a211167a11f3c636`  
**Implementation SHA:** not in HEAD (certified working tree of frozen surfaces below)

Epic 3 is a Product Platform projection. It does not own identities. It aggregates certified `ContinuityPackage` by `patientId` and does not write Core.

`CorrelationId` remains observability only. `patientId` is an aggregation filter, not a fifth official identity.

## Certification

| ID | Result | Validating test |
|----|--------|-----------------|
| LON-1 | PASS | `LON-1 One Encounter, current ClinicalActId` → one item per Encounter; mix of ClinicalActId → error; same act → one item |
| LON-2 | PASS | `LON-2 Absent handoff is an item` → `keeps visits without a clinical act` |
| LON-3 | PASS | `LON-3 Unpaid does not drop or reorder` → `keeps unpaid packages in asOf order` |
| LON-4 | PASS | `LON-4 Membership includes delivered` → `does not exclude delivered documents` |
| LON-5 | PASS | `LON-5 Chronological asOf order` → `asOf` ascending; tie-break `EncounterId` |
| LON-6 | PASS | `LON-6 asOf is copied from the package` → no patient-level `asOf`; empty `asOf` → error |
| LON-7 | PASS | `LON-7 / LON-10 / LON-11 Freeze boundary` → no Core writes / workflows |
| LON-8 | PASS | `LON-8 PRODUCT-1 and PRODUCT-2` → six metrics; `totalContinuityPackages === activeClinicalActs + absentHandOffCount` |
| LON-9 | PASS | `LON-9 Determinism` → `projects the same line from the same packages` |
| LON-10 | PASS | `LON-7 / LON-10 / LON-11 Freeze boundary` (no LocalStorage, SessionStorage, `Date.now`, `new Date`) |
| LON-11 | PASS | `LON-7 / LON-10 / LON-11 Freeze boundary` (no Delivery Queue, Revenue Integrity, Settlement/Completion UI, `ContinuityPanelShell`, `PanelLayout`; v1.0 barrel unchanged) |
| LON-12 | PASS | `LON-12 / LON-13 product keys` → surface `/panel/continuidad-longitudinal/[patientId]`; CTA opens certified Encounter ficha |
| LON-13 | PASS | `LON-12 / LON-13 product keys` → keys `patientId` + `EncounterId` + `ClinicalActId` if present |

Epic 3 tests at certification: 16/16 PASS.

Regression at certification (100 tests, 100 PASS): RC-19A Sprint 1 P0, Sprint 2 D2/D3/D4/D6/D8, Clinical Completion CC-1…CC-11, Commercial Settlement CS-1…CS-11, Clinical Operations COD-1…COD-10, Patient Care Continuity PCC-1…PCC-10, Product Platform v1.0 PCC-Q1…PCC-Q4 + PRODUCT-1 + PRODUCT-2, Product Platform v2.0 REV-1…REV-12.

## Frozen invariants

Do not modify this Epic without:

1. An independent incident.
2. Explicit authorization.
3. A new certification.

Frozen:

- One Encounter = one `ContinuityPackage` item
- One current `ClinicalActId` per Encounter, or explicit `handoff: "absent"`
- Chronological order by COD `asOf` ascending; tie-break `EncounterId` ascending
- Recalculation on every load from PCC (`loadContinuityPackage` → COD)
- Read-only (Encounter list only to enumerate `signed` / `locked` ids by `patientId`)
- No persistence, no domain store, no LocalStorage, no SessionStorage, no clock as functional source, no workflow calls
- PRODUCT-1 metrics: `totalContinuityPackages`, `activeClinicalActs`, `absentHandOffCount`, `deliveredDocumentCount`, `visitSummaryCount`, `prescriptionCount`
- Invariant: `totalContinuityPackages === activeClinicalActs + absentHandOffCount`
- Independence from Clinical Delivery Queue and Revenue Integrity Dashboard

## Frozen surfaces

- `lib/product-platform/longitudinal-continuity/**`
- `app/panel/continuidad-longitudinal/[patientId]/page.tsx`
- `docs/EPIC_LONGITUDINAL_PATIENT_CONTINUITY.md`

Core Platform, Architecture Baseline, Product Platform v1.0 (Clinical Delivery Queue), Product Platform v2.0 (Revenue Integrity Dashboard), RC-19A, Clinical Completion, Commercial Settlement, Clinical Operations Projection, and Patient Care Continuity remain CERTIFIED and are not modified by this Epic.
