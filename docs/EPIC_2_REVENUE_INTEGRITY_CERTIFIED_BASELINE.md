# Epic 2 — Revenue Integrity Dashboard — certified baseline

**Status:** CERTIFIED  
**Frozen:** 2026-08-24  
**Product Platform:** v2.0  
**Epic:** Revenue Integrity Dashboard  
**Branch:** `feat/phase-19a-clinical-workspace-closure`  
**HEAD at certification:** `6d6ec01cd9cb14af9bee9748a211167a11f3c636`  
**Implementation SHA:** not in HEAD (certified working tree of frozen surfaces below)

Epic 2 is a Product Platform projection. It does not own identities. It classifies `ClinicalOperationsView` into exclusive commercial buckets and does not write Core.

`CorrelationId` remains observability only.

## Certification

| ID | Result | Validating test |
|----|--------|-----------------|
| REV-1 | PASS | `REV-1 signed unpaid` → `maps signed + !isPaid to signed_unpaid, not commercially_locked` |
| REV-2 | PASS | `REV-2 lock anomaly is not repaired` → `maps locked Encounter without payment to lock_anomaly` |
| REV-3 | PASS | `REV-3 lock anomaly does not count as commercially locked` → `does not increment commerciallyLockedCount` |
| REV-4 | PASS | `REV-4 payment_verified, invoiced, commercially_locked` → `classifies the three paid stages` |
| REV-5 | PASS | `REV-5 Completion does not change the bucket` → `ignores deliveredAt and document_ready when classifying` |
| REV-6 | PASS | `REV-6 / REV-10 / REV-11 No writes and freeze boundary` → `does not import workflows, persistence, Delivery Queue, or frozen chrome` |
| REV-7 | PASS | `REV-7 No new identity` → `reuses EncounterId and SettlementId from COD only` |
| REV-8 | PASS | `REV-8 PRODUCT-1 and PRODUCT-2` → `exposes required metrics and the epic contract` |
| REV-9 | PASS | `REV-9 Determinism` → `projects the same dashboard from the same COD views` |
| REV-10 | PASS | `REV-6 / REV-10 / REV-11 No writes and freeze boundary` (no LocalStorage, SessionStorage, `Date.now`, `new Date`) |
| REV-11 | PASS | `REV-6 / REV-10 / REV-11 No writes and freeze boundary` (no Delivery Queue, Settlement UI, Completion UI, PanelLayout, facturación) |
| REV-12 | PASS | `REV-12 product surface and mix guard` → `rejects mixed Settlement identities for one Encounter`; surface `/panel/integridad-ingresos` |

Regression at certification (93 tests, 93 PASS): RC-19A Sprint 1 P0, Sprint 2 D2/D3/D4/D6/D8, Clinical Completion CC-1…CC-11, Commercial Settlement CS-1…CS-11, Clinical Operations COD-1…COD-10, Patient Care Continuity PCC-1…PCC-10, Product Platform v1.0 PCC-Q1…PCC-Q4 + PRODUCT-1 + PRODUCT-2.

## Frozen invariants

Do not modify this Epic without:

1. An independent incident.
2. Explicit authorization.
3. A new certification.

Frozen:

- Exclusive buckets: `signed_unpaid`, `payment_verified`, `invoiced`, `commercially_locked`, `lock_anomaly`
- Recalculation on every load from `ClinicalOperationsView`
- Read-only (Settlement via COD; Encounter list only to enumerate `signed` / `locked` ids)
- No persistence, no domain store, no LocalStorage, no workflow calls
- PRODUCT-1 metrics: `signedUnpaidCount`, `verifiedWithoutInvoiceCount`, `invoicedUnlockedCount`, `lockAnomalyCount`, `commerciallyLockedCount`
- Independence from Clinical Delivery Queue

## Frozen surfaces

- `lib/product-platform/revenue-integrity/**`
- `app/panel/integridad-ingresos/page.tsx`

Core Platform, Architecture Baseline, Product Platform v1.0 (Clinical Delivery Queue), RC-19A, Clinical Completion, Commercial Settlement, Clinical Operations Projection, and Patient Care Continuity remain CERTIFIED and are not modified by this Epic.
