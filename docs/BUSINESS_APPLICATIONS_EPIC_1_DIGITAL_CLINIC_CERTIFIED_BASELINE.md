# Business Applications Epic 1 — Digital Clinic — certified baseline

**Status:** CERTIFIED  
**Frozen:** 2026-08-25  
**Phase:** Business Applications  
**Epic:** Digital Clinic (BA-CD-1)  
**Branch:** `feat/phase-19a-clinical-workspace-closure`  
**HEAD at certification:** `6d6ec01cd9cb14af9bee9748a211167a11f3c636`  
**Implementation SHA:** not in HEAD (certified working tree of frozen surfaces below)

Digital Clinic is a **business process layer**. It is not Product Platform v7.0. It does not own identities. It orchestrates navigation to CORE_PLATFORM and PRODUCT_PLATFORM v6.0 LTS surfaces and does not write Core.

`patientId` is an aggregation filter already used by Product v3.0/v4.0, not a fifth official identity. Process names (`atencion`, `caja`, `direccion`, `operaciones`) are labels, not domain ids.

CORE_PLATFORM and PRODUCT_PLATFORM v6.0 remain LTS and are not modified by this Epic.

## Certification

| ID | Result | Validating test |
|----|--------|-----------------|
| BA-1 | PASS | `BA-1 Consume LTS only` → cero writes Core; cero projectores de producto |
| BA-2 | PASS | `BA-2 No persisted domain` → sin `DigitalClinicId` ni storage |
| BA-3 | PASS | `BA-3 No new identities` → navegación con `EncounterId` y `patientId` LTS |
| BA-4 | PASS | `BA-4 No Core workflows` → `writes: false`; cero `run*` / `ensure*` / `observe*` / `persist*` / `save*` |
| BA-5 | PASS | `BA-5 LTS unmodified` → barrel v1.0 intacto; cero `/panel/clinica-digital`; cero `PanelLayout` |
| BA-6 | PASS | `BA-6 Processes are separate` → `atencion`, `caja`, `direccion`, `operaciones` |
| BA-7 | PASS | `BA-7 Unique actor per process` → médico, caja, dirección médica, operaciones |
| BA-8 | PASS | `BA-8 Does not duplicate Product projections` → no carga v1–v4; Operaciones solo lee el pulso v5.0 |
| BA-9 | PASS | `BA-9 Attention does not charge; caja does not emit` → Atención fuera de v2.0; Caja fuera de brief/entrega |
| BA-10 | PASS | `BA-10 Caja is per Encounter` → `/panel/integridad-ingresos` + ficha de un Encounter |
| BA-11 | PASS | `BA-11 Direccion uses only the pulse` → solo `/panel/pulso-operativo` |
| BA-12 | PASS | `BA-12 Surfaces are existing LTS URLs` → brief, continuidad, consultas, entrega, integridad, pulso |

Epic 1 tests at certification: 12/12 PASS.

Regression at certification (161 tests, 161 PASS): RC-19A Sprint 1 P0, Sprint 2 D2/D3/D4/D6/D8, overlay, Clinical Completion CC-1…CC-11, Commercial Settlement CS-1…CS-11, Clinical Operations COD-1…COD-10, Patient Care Continuity PCC-1…PCC-10, Product Platform v1.0–v6.0.

## Frozen invariants

Do not modify this Epic without:

1. An independent incident.
2. Explicit authorization.
3. A new certification.

Frozen:

- Exactly four processes: Atención, Caja por Encounter, Dirección Médica, Operaciones
- One actor per process; `writes: false` on the process layer
- Navigation only to existing LTS URLs (no new route, no sidebar, no PanelLayout change)
- Operaciones consumes `loadOperationalPulse` and does not reproject v1.0–v4.0
- Atención does not navigate to Revenue Integrity
- Caja does not navigate to brief or delivery queue
- Dirección navigates only to Operational Pulse
- Caja is per `EncounterId`, not per day or convenio
- No persistence, domain store, LocalStorage, SessionStorage, clock as process source, or Core workflow calls

## Frozen surfaces

- `lib/business-applications/digital-clinic/**`

Core Platform, Architecture Baseline, Product Platform v1.0–v6.0, RC-19A, Clinical Completion, Commercial Settlement, Clinical Operations Projection, Patient Care Continuity, Auth, Workspace, Foundation, Branding, WebRTC, PanelLayout, portal, and agenda remain LTS / CERTIFIED and are not modified by this Epic.
