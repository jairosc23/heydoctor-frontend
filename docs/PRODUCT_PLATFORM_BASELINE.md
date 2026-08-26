# Product Platform baseline

**Registered:** 2026-08-25  
**Version:** **v6.0**  
**Status:** CERTIFIED  
**Branch:** `feat/phase-19a-clinical-workspace-closure`  
**HEAD at certification:** `6d6ec01cd9cb14af9bee9748a211167a11f3c636`

Product Platform is separate from Core Platform. New product Epics consume Core and do not modify it.

v1.0 remains CERTIFIED and frozen. v2.0 remains CERTIFIED and frozen. v3.0 remains CERTIFIED and frozen. v4.0 remains CERTIFIED and frozen. v5.0 remains CERTIFIED and frozen. v6.0 adds Epic 6 without changing v1.0–v5.0 surfaces.

## PRODUCT-1

Each Epic must expose product metrics that measure its clinical and operational impact.

## PRODUCT-2

Every Epic follows the same contract:

- Objective
- Dependencies
- Read Model
- No Writes
- PASS
- Metrics

## Certified Epics

| Version | Epic | Status | Baseline / contract |
|---------|------|--------|---------------------|
| v1.0 | Epic 1 — Clinical Delivery Queue | CERTIFIED / frozen | `docs/EPIC_CLINICAL_DELIVERY_QUEUE.md` · `lib/product-platform/clinical-delivery-queue/**` · `/panel/entrega-clinica` |
| v2.0 | Epic 2 — Revenue Integrity Dashboard | CERTIFIED / frozen | `docs/EPIC_2_REVENUE_INTEGRITY_CERTIFIED_BASELINE.md` · `lib/product-platform/revenue-integrity/**` · `/panel/integridad-ingresos` |
| v3.0 | Epic 3 — Longitudinal Patient Continuity | CERTIFIED / frozen | `docs/EPIC_3_LONGITUDINAL_CONTINUITY_CERTIFIED_BASELINE.md` · `lib/product-platform/longitudinal-continuity/**` · `/panel/continuidad-longitudinal/[patientId]` |
| v4.0 | Epic 4 — Pre-Visit Clinical Brief | CERTIFIED / frozen | `docs/EPIC_4_PRE_VISIT_CLINICAL_BRIEF_CERTIFIED_BASELINE.md` · `lib/product-platform/pre-visit-clinical-brief/**` · `/panel/brief-previsita/[patientId]` |
| v5.0 | Epic 5 — Operational Pulse Dashboard | CERTIFIED / frozen | `docs/EPIC_5_OPERATIONAL_PULSE_CERTIFIED_BASELINE.md` · `lib/product-platform/operational-pulse/**` · `/panel/pulso-operativo` |
| v6.0 | Epic 6 — Patient Portal | CERTIFIED / frozen | `docs/EPIC_6_PATIENT_PORTAL_CERTIFIED_BASELINE.md` · `lib/product-platform/patient-portal/**` · `/portal/encounter/[encounterId]` |

## Frozen surfaces (Product Platform)

**v1.0**  
`lib/product-platform/clinical-delivery-queue/**`  
`app/panel/entrega-clinica/page.tsx`

**v2.0**  
`lib/product-platform/revenue-integrity/**`  
`app/panel/integridad-ingresos/page.tsx`

**v3.0**  
`lib/product-platform/longitudinal-continuity/**`  
`app/panel/continuidad-longitudinal/[patientId]/page.tsx`

**v4.0**  
`lib/product-platform/pre-visit-clinical-brief/**`  
`app/panel/brief-previsita/[patientId]/page.tsx`

**v5.0**  
`lib/product-platform/operational-pulse/**`  
`app/panel/pulso-operativo/page.tsx`

**v6.0**  
`lib/product-platform/patient-portal/**`  
`app/portal/(app)/encounter/[encounterId]/page.tsx`

Do not modify these surfaces without an independent incident, explicit authorization, and a new certification.

Core Platform (`docs/CORE_PLATFORM.md`) and Architecture Baseline (`docs/ARCHITECTURE_BASELINE.md`) remain CERTIFIED and frozen.
