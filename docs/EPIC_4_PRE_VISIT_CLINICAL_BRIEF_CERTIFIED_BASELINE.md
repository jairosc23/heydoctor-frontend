# Epic 4 — Pre-Visit Clinical Brief — certified baseline

**Status:** CERTIFIED  
**Frozen:** 2026-08-24  
**Product Platform:** v4.0  
**Epic:** Pre-Visit Clinical Brief  
**Branch:** `feat/phase-19a-clinical-workspace-closure`  
**HEAD at certification:** `6d6ec01cd9cb14af9bee9748a211167a11f3c636`  
**Implementation SHA:** not in HEAD (certified working tree of frozen surfaces below)

Epic 4 is a Product Platform projection. It does not own identities. It derives one briefing from the last `LongitudinalContinuityItem` and does not write Core.

`CorrelationId` remains observability only. `patientId` is an aggregation filter, not a fifth official identity.

## Certification

| ID | Result | Validating test |
|----|--------|-----------------|
| PVB-1 | PASS | `PVB-1 Last item only, no look-back` → `items[n-1]`; no look-back to last `present`; no re-sort |
| PVB-2 | PASS | `PVB-2 Current ClinicalActId or absent` → copies last present `ClinicalActId` |
| PVB-3 | PASS | `PVB-3 Empty line is an empty brief` → `status: "empty"`; no minted act |
| PVB-4 | PASS | `PVB-4 Unpaid does not hide the origin` → last item kept; settlement does not filter |
| PVB-5 | PASS | `PVB-5 Delivered last act remains in the brief` → `deliveredAt` copied; not Delivery Queue |
| PVB-6 | PASS | `PVB-6 asOf is copied from the last item` → no brief-level `asOf`; empty `asOf` → error |
| PVB-7 | PASS | `PVB-7 / PVB-10 / PVB-11 Freeze boundary` → no Core writes / workflows |
| PVB-8 | PASS | `PVB-8 PRODUCT-1 and PRODUCT-2` → seven metrics; `briefAvailable + briefEmpty === 1` |
| PVB-9 | PASS | `PVB-9 Determinism` → `projects the same brief from the same line` |
| PVB-10 | PASS | `PVB-7 / PVB-10 / PVB-11 Freeze boundary` (no LocalStorage, SessionStorage, `Date.now`, `new Date`) |
| PVB-11 | PASS | `PVB-7 / PVB-10 / PVB-11 Freeze boundary` (no Delivery Queue, Revenue Integrity, PCC/COD direct, Epic 3 UI, Settlement/Completion UI, `ContinuityPanelShell`, `PanelLayout`; v1.0 barrel unchanged) |
| PVB-12 | PASS | `PVB-12 / PVB-13 product keys` → surface `/panel/brief-previsita/[patientId]`; CTA opens certified Encounter ficha |
| PVB-13 | PASS | `PVB-12 / PVB-13 product keys` → keys `patientId` + origin `EncounterId` + `ClinicalActId` if present |

Epic 4 tests at certification: 15/15 PASS.

Regression at certification (116 tests, 116 PASS): RC-19A Sprint 1 P0, Sprint 2 D2/D3/D4/D6/D8, Clinical Completion CC-1…CC-11, Commercial Settlement CS-1…CS-11, Clinical Operations COD-1…COD-10, Patient Care Continuity PCC-1…PCC-10, Product Platform v1.0 PCC-Q1…PCC-Q4 + PRODUCT-1 + PRODUCT-2, Product Platform v2.0 REV-1…REV-12, Product Platform v3.0 LON-1…LON-13.

## Frozen invariants

Do not modify this Epic without:

1. An independent incident.
2. Explicit authorization.
3. A new certification.

Frozen:

- One briefing per load, derived only from `items[n-1]` of `LongitudinalContinuityProjection`
- Empty line → `status: "empty"`, `origin: null`; no minted `ClinicalActId`
- No look-back to the last `handoff === "present"`
- No re-sort of the longitudinal line
- `origin.asOf` copied from the last item; no brief-level `asOf`
- Recalculation on every load from Epic 3
- Read-only (PCC and COD only through Epic 3)
- No persistence, no domain store, no LocalStorage, no SessionStorage, no clock as functional source, no workflow calls
- PRODUCT-1 metrics: `briefAvailable`, `briefEmpty`, `sourceEncounterId`, `sourceClinicalActPresent`, `sourceDocumentKind`, `sourceDelivered`, `sourceAsOf`
- Invariant: `briefAvailable + briefEmpty === 1`
- Independence from Clinical Delivery Queue, Revenue Integrity Dashboard, and Longitudinal Continuity UI

## Frozen surfaces

- `lib/product-platform/pre-visit-clinical-brief/**`
- `app/panel/brief-previsita/[patientId]/page.tsx`
- `docs/EPIC_PRE_VISIT_CLINICAL_BRIEF.md`

Core Platform, Architecture Baseline, Product Platform v1.0 (Clinical Delivery Queue), Product Platform v2.0 (Revenue Integrity Dashboard), Product Platform v3.0 (Longitudinal Patient Continuity), RC-19A, Clinical Completion, Commercial Settlement, Clinical Operations Projection, and Patient Care Continuity remain CERTIFIED and are not modified by this Epic.
