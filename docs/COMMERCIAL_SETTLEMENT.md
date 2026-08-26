# Commercial Settlement Workflow

**Domain:** Commercial Settlement  
**Front:** frontend only  
**Status:** implemented against the approved design (CS-1 … CS-11)

Closes the commercial cycle of a **signed** Encounter: verified payment, receipt, and the existing transition `signed → locked`.

Clinical Completion and `ClinicalActId` are not modified.

## Official identity table

| Identity | Domain | Role | Must not be used as |
|---|---|---|---|
| **EncounterId** | Encounter | Canonical identity of one Encounter (`consultation.id`) | ClinicalActId, SettlementId, CorrelationId |
| **ClinicalActId** | Clinical Completion | Canonical identity of one clinical act | SettlementId, CorrelationId |
| **SettlementId** | Commercial Settlement | Canonical identity of one commercial settlement. Bound to exactly one Encounter | ClinicalActId, CorrelationId |
| **CorrelationId** | Observability | Tracing and request correlation only | Encounter, ClinicalAct, or Settlement identity |

`SettlementId` and `ClinicalActId` of the same Encounter are independent (CS-1).

## Commercial states

`pending → payment_initiated → payment_verified → invoiced → locked`

Encounter states are unchanged: `draft → in_progress → completed → signed → locked`.

## PASS criteria

| ID | Criterion |
|---|---|
| CS-1 | `SettlementId` ≠ `ClinicalActId` |
| CS-2 | Commercial lock only after `payment_verified` (`isPaid`). Encounter `locked` without payment is an anomaly |
| CS-3 | Lock never mutates Clinical Completion / ClinicalAct |
| CS-4 | Payment session only when Encounter is `signed` |
| CS-5 | `?payment=` is not verification |
| CS-6 | Re-entry reuses the same `(settlementId, encounterId)` and does not open another session after `isPaid` |
| CS-7 | No clinical writes (HAB / emit / completion store) |
| CS-8 | Invoice only after payment verified |
| CS-9 | Every Settlement belongs to exactly one existing Encounter; `settlementId` is not reassigned |
| CS-10 | Creation is atomic: `settlementId` and `encounterId` are born together; failure rolls back completely |
| CS-11 | From a `SettlementId` the chain Encounter → Payment Session → Payment Verification → Invoice → Lock can be reconstructed |

## Surfaces

- `lib/commercial-settlement/**`
- `app/panel/consultas/[id]/_components/chart/CommercialSettlementSection.tsx`
- Mount in `EncounterClosureSection.tsx` **after** the Clinical Completion block (that block is not edited)

Out of scope: Clinical Completion, RC-19A freeze, Auth, Workspace, Foundation, Branding, WebRTC, Portal.
