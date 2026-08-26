# Epic 6 — Patient Portal — certified baseline

**Status:** CERTIFIED  
**Frozen:** 2026-08-25  
**Product Platform:** v6.0  
**Epic:** Patient Portal  
**Branch:** `feat/phase-19a-clinical-workspace-closure`  
**HEAD at certification:** `6d6ec01cd9cb14af9bee9748a211167a11f3c636`  
**Implementation SHA:** not in HEAD (certified working tree of frozen surfaces below)

Epic 6 is a Product Platform projection. It does not own identities. It derives one patient consult (`PortalEncounterView`) from a certified `ContinuityPackage` and does not write Core.

`CorrelationId` remains observability only. `availability` and `delivery.status` are product labels, not Encounter, Completion, or Settlement states.

The legacy patient portal (`app/portal` citas / pagos / historial / Auth / `PortalShell`) remains out of this Epic and is not modified by it.

## Certification

| ID | Result | Validating test |
|----|--------|-----------------|
| PP-1 | PASS | `PP-1 READ ONLY` → cero `run*` / `save*` / `persist*` en superficies Epic 6 |
| PP-2 | PASS | `PP-2 No workflows` → cero `ensure*` / `observe*` / workflows |
| PP-3 | PASS | `PP-3 ContinuityPackage is the only clinical source` → `loadContinuityPackage`; no reentra COD ni stores |
| PP-4 | PASS | `PP-4 Does not consume v1.0–v5.0` → cero loaders/módulos v1–v5 |
| PP-5 | PASS | `PP-5 Official identities only` → clave `EncounterId`; `ClinicalActId` copiado o `document == null`; sin identidades nuevas |
| PP-6 | PASS | `PP-6 Document visible only when delivered` → documento solo si `deliveredAt != null`; impago no oculta entrega |
| PP-7 | PASS | `PP-7 Commercial is informational` → `SettlementId` / `isPaid` informativos; sin `lockAnomaly`; sin CTA de pago |
| PP-8 | PASS | `PP-8 Patient surface only` → `/portal/encounter/[encounterId]`; cero chrome `/panel` |
| PP-9 | PASS | `PP-9 Frozen baselines untouched` → barrel v1.0 intacto; cero imports de portal legado |
| PP-10 | PASS | `PP-10 Deterministic projection, no browser source` → misma entrada → misma vista; sin clock / storage |
| PP-11 | PASS | `PP-11 PRODUCT-1 and PRODUCT-2` → cinco métricas; contrato PRODUCT-2 |
| PP-12 | PASS | `PP-12 Unavailable without minting` → Encounter vacío o PCC no derivable → `unavailable`; no mint |

Epic 6 tests at certification: 18/18 PASS (suites PP-1…PP-12).

Regression at certification (143 tests, 143 PASS): RC-19A Sprint 1 P0, Sprint 2 D2/D3/D4/D6/D8, overlay contract, Clinical Completion CC-1…CC-11, Commercial Settlement CS-1…CS-11, Clinical Operations COD-1…COD-10, Patient Care Continuity PCC-1…PCC-10, Product Platform v1.0 PCC-Q1…PCC-Q4 + PRODUCT-1 + PRODUCT-2, Product Platform v2.0 REV-1…REV-12, Product Platform v3.0 LON-1…LON-13, Product Platform v4.0 PVB-1…PVB-13, Product Platform v5.0 OPD-1…OPD-13.

## Frozen invariants

Do not modify this Epic without:

1. An independent incident.
2. Explicit authorization.
3. A new certification.

Frozen:

- One `PortalEncounterView` per `EncounterId`, derived only from `ContinuityPackage`
- Document in UI only when `clinicalHandoff.present` ∧ `deliveredAt != null`
- `deliveredAt == null` with handoff present → copy «Pendiente de entrega»; `document == null`
- Payment does not hide a delivered document (PCC-5)
- Commercial context is informational (`settlementId`, `isPaid`); `lockAnomaly` is not a patient surface
- PCC/COD failure or empty `EncounterId` → `availability: "unavailable"`; no minted `asOf`, `ClinicalActId`, or `SettlementId`
- Recalculation on every load from `loadContinuityPackage`
- Read-only (Completion and Settlement only as slices already resolved in PCC)
- No persistence, no domain store, no LocalStorage, no SessionStorage, no clock as functional source, no workflow calls
- PRODUCT-1 metrics: `portalEncounterAvailable`, `portalHandoffPresent`, `portalDocumentDelivered`, `portalDocumentKind`, `portalCommerciallyPaid`
- Invariant: `portalDocumentDelivered` implies `portalHandoffPresent`; if `portalEncounterAvailable === 0`, remaining metrics are 0
- Independence from `/panel`, Product Platform v1.0–v5.0, and the legacy portal tree

## Frozen surfaces

- `lib/product-platform/patient-portal/**`
- `app/portal/(app)/encounter/[encounterId]/page.tsx`
- `docs/EPIC_PATIENT_PORTAL.md`

Core Platform, Architecture Baseline, Product Platform v1.0 (Clinical Delivery Queue), Product Platform v2.0 (Revenue Integrity Dashboard), Product Platform v3.0 (Longitudinal Patient Continuity), Product Platform v4.0 (Pre-Visit Clinical Brief), Product Platform v5.0 (Operational Pulse Dashboard), RC-19A, Clinical Completion, Commercial Settlement, Clinical Operations Projection, Patient Care Continuity, Auth, and the legacy patient portal remain CERTIFIED and are not modified by this Epic.
