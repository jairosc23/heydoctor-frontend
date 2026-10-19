# Patient Care Continuity — certified baseline

**Status:** CERTIFIED  
**Frozen:** 2026-08-24  
**Domain:** Patient Care Continuity  
**Kind:** Continuity Package (ephemeral projection; not a write domain)  
**Branch:** `feat/phase-19a-clinical-workspace-closure`

A `ContinuityPackage` is derived from one `ClinicalOperationsView`. It is keyed by `EncounterId` and may represent only the current `ClinicalActId` of that Encounter. It is not persisted and is not a source of truth.

Settlement is operational context. Clinical handoff does not require payment.

`CorrelationId` remains reserved for observability and tracing. It is not a Continuity identity.

This is not the RC-19A Continuity panel (`ContinuityPanelShell`).

## Certification

| ID | Result |
|----|--------|
| PCC-1 | PASS |
| PCC-2 | PASS |
| PCC-3 | PASS |
| PCC-4 | PASS |
| PCC-5 | PASS |
| PCC-6 | PASS |
| PCC-7 | PASS |
| PCC-8 | PASS |
| PCC-9 | PASS |
| PCC-10 | PASS |

## Frozen invariants

Do not modify this domain without:

1. An independent incident.
2. Explicit authorization.
3. A new certification.

Frozen:

- Derivation from `ClinicalOperationsView` only
- Join by `EncounterId`
- Current `ClinicalActId` only (PCC-9); never mix clinical acts
- Ephemeral package; never persisted (PCC-10)
- Clinical handoff independent of payment
- Lock anomaly copied, not repaired

## Frozen surfaces

- `lib/patient-care-continuity/**`

ARCHITECTURE_BASELINE, Clinical Completion, Commercial Settlement, Clinical Operations Projection, RC-19A, Auth, Workspace, Clinical Foundation, Branding, WebRTC, and the patient portal remain out of this domain and are not modified by it.
