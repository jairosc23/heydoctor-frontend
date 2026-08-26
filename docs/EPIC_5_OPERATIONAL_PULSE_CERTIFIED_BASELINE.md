# Epic 5 — Operational Pulse Dashboard — certified baseline

**Status:** CERTIFIED  
**Frozen:** 2026-08-25  
**Product Platform:** v5.0  
**Epic:** Operational Pulse Dashboard  
**Branch:** `feat/phase-19a-clinical-workspace-closure`  
**HEAD at certification:** `6d6ec01cd9cb14af9bee9748a211167a11f3c636`  
**Implementation SHA:** not in HEAD (certified working tree of frozen surfaces below)

Epic 5 is a Product Platform projection. It does not own identities. It composes certified v1.0–v4.0 photographs into one clinic pulse and does not write Core.

`CorrelationId` remains observability only. `pulseStatus` is a product label, not an Encounter, Completion, or Settlement state.

## Certification

| ID | Result | Validating test |
|----|--------|-----------------|
| OPD-1 | PASS | `OPD-1 Pulse is not a worklist` → no `items` / `origin`; not a queue or ficha |
| OPD-2 | PASS | `OPD-2 Delivery backlog copies v1.0 count` → `pulseDeliveryBacklog === pendingDeliveryCount` |
| OPD-3 | PASS | `OPD-3 Commercial at-risk sums v2.0 metrics` → unpaid + lock anomaly; lock is not closure |
| OPD-4 | PASS | `OPD-4 Continuity via v4.0 briefs` → ready / empty / last absent via v4.0 (v3.0 inside) |
| OPD-5 | PASS | `OPD-5 Unpaid does not change clinical pulse` → delivery and brief counts unchanged |
| OPD-6 | PASS | `OPD-6 No clinic asOf` → pulse does not publish or merge `asOf` |
| OPD-7 | PASS | `OPD-7 / OPD-10 / OPD-11 Freeze boundary` → no Core writes / workflows |
| OPD-8 | PASS | `OPD-8 PRODUCT-1, status, alerts, composition` → seven metrics; `pulseBriefReady + pulseBriefEmpty === pulsePatientsScanned` |
| OPD-9 | PASS | `OPD-9 Determinism` → same certified inputs → same pulse |
| OPD-10 | PASS | `OPD-7 / OPD-10 / OPD-11 Freeze boundary` (no LocalStorage, SessionStorage, `Date.now`, `new Date`) |
| OPD-11 | PASS | `OPD-7 / OPD-10 / OPD-11 Freeze boundary` (no PCC/COD/Completion/Settlement, no v1–v4 projectors, no frozen chrome; v1.0 barrel unchanged) |
| OPD-12 | PASS | `OPD-12 / OPD-13 product surface` → `/panel/pulso-operativo`; CTAs to v1.0 and v2.0 |
| OPD-13 | PASS | `OPD-12 / OPD-13 product surface` → no new identity; does not mint ids |

Epic 5 tests at certification: 12/12 PASS.

Regression at certification (131 tests, 131 PASS): RC-19A Sprint 1 P0, Sprint 2 D2/D3/D4/D6/D8, Clinical Completion CC-1…CC-11, Commercial Settlement CS-1…CS-11, Clinical Operations COD-1…COD-10, Patient Care Continuity PCC-1…PCC-10, Product Platform v1.0 PCC-Q1…PCC-Q4 + PRODUCT-1 + PRODUCT-2, Product Platform v2.0 REV-1…REV-12, Product Platform v3.0 LON-1…LON-13, Product Platform v4.0 PVB-1…PVB-13.

## Frozen invariants

Do not modify this Epic without:

1. An independent incident.
2. Explicit authorization.
3. A new certification.

Frozen:

- One pulse per load, composed from `ClinicalDeliveryQueue`, `RevenueIntegrityDashboard`, and `PreVisitClinicalBrief[]`
- v3.0 consumed only through v4.0 (`loadPreVisitBrief`)
- No clinic-level `asOf`; source `asOf` values are not min/max merged
- Recalculation on every load from certified v1.0–v4.0 loaders
- Read-only (PCC/COD/Completion/Settlement not called from this Epic)
- No persistence, no domain store, no LocalStorage, no SessionStorage, no clock as functional source, no workflow calls
- PRODUCT-1 metrics: `pulseDeliveryBacklog`, `pulseCommercialAtRisk`, `pulseCommercialClosed`, `pulsePatientsScanned`, `pulseBriefReady`, `pulseBriefEmpty`, `pulseLastHandoffAbsent`
- Invariant: `pulseBriefReady + pulseBriefEmpty === pulsePatientsScanned`
- Independence from Delivery Queue UI, Revenue Integrity UI, Longitudinal UI, and Pre-Visit Brief UI

## Frozen surfaces

- `lib/product-platform/operational-pulse/**`
- `app/panel/pulso-operativo/page.tsx`
- `docs/EPIC_OPERATIONAL_PULSE_DASHBOARD.md`

Core Platform, Architecture Baseline, Product Platform v1.0 (Clinical Delivery Queue), Product Platform v2.0 (Revenue Integrity Dashboard), Product Platform v3.0 (Longitudinal Patient Continuity), Product Platform v4.0 (Pre-Visit Clinical Brief), RC-19A, Clinical Completion, Commercial Settlement, Clinical Operations Projection, and Patient Care Continuity remain CERTIFIED and are not modified by this Epic.
