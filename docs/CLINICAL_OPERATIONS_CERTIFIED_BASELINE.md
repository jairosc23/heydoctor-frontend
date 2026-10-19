# Clinical Operations Projection — certified baseline

**Status:** CERTIFIED  
**Frozen:** 2026-08-24  
**Domain:** Clinical Operations  
**Kind:** Clinical Operations Projection (not a write domain)  
**Branch:** `feat/phase-19a-clinical-workspace-closure`

COD does not own `EncounterId`, `ClinicalActId`, or `SettlementId`. It does not persist. It projects Encounter, Clinical Completion, and Commercial Settlement at one logical instant (`asOf`).

`CorrelationId` remains reserved for observability and tracing. It is not a COD identity.

## Certification

| ID | Result |
|----|--------|
| COD-1 | PASS |
| COD-2 | PASS |
| COD-3 | PASS |
| COD-4 | PASS |
| COD-5 | PASS |
| COD-6 | PASS |
| COD-7 | PASS |
| COD-8 | PASS |
| COD-9 | PASS |
| COD-10 | PASS |

## Frozen invariants

Do not modify this domain without:

1. An independent incident.
2. Explicit authorization.
3. A new certification.

Frozen:

- Read-only projection
- Join by `EncounterId` only
- Single logical `asOf` (COD-9)
- Determinism: pure function of Encounter + Clinical Completion + Commercial Settlement (COD-10)
- Absence is not minted
- Lock anomaly is projected, not repaired

## Frozen surfaces

- `lib/clinical-operations/**`

Encounter, Clinical Completion, Commercial Settlement, RC-19A, Auth, Workspace, Clinical Foundation, Branding, WebRTC, and the patient portal remain out of this domain and are not modified by it.
