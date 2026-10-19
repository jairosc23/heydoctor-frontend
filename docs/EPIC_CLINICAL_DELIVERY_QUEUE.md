# Epic 1 — Clinical Delivery Queue

Product Platform. Consumes Core. Does not modify Core.

## Objective

List Encounters whose current clinical act is `document_ready` and not yet delivered, so the physician can finish the certified handoff.

## Dependencies

Read-only:

- Encounter ids (`signed` / `locked`)
- `ClinicalOperationsView`
- `ContinuityPackage` (current `ClinicalActId` only)

No Core writes. Delivery stays on the certified Encounter UI.

## Read Model

One queue item = one `EncounterId` + current `ClinicalActId`.

Membership: `clinicalHandoff.state === "document_ready"` and `deliveredAt == null`.

Absent Completion is not queued. Payment does not gate membership.

## No Writes

Does not call `run*` / `ensure*` / `observe*` / `initiate*` / `persist*` / `save*`.

Does not persist a `ContinuityPackage`. Does not mint identities.

## PASS

| ID | Criterion |
|----|-----------|
| PCC-Q1 | One item per Encounter; current `ClinicalActId` only; mixed acts fail |
| PCC-Q2 | Only `document_ready` with `deliveredAt == null` |
| PCC-Q3 | No Core writes; no frozen chrome imports |
| PCC-Q4 | Absent Completion is skipped, not minted |
| PRODUCT-1 | Queue exposes clinical/operational metrics |
| PRODUCT-2 | Contract sections are Objective, Dependencies, Read Model, No Writes, PASS, Metrics |

## Metrics

| Metric | Meaning |
|--------|---------|
| `encountersScanned` | Unique Encounter packages considered |
| `pendingDeliveryCount` | Queue size (clinical impact) |
| `pendingPrescriptionCount` | Pending prescription handoffs |
| `pendingVisitSummaryCount` | Pending visit-summary handoffs |
| `skippedAbsentCompletion` | No current act |
| `skippedAlreadyDelivered` | Already delivered |
| `skippedOtherState` | Act present but not `document_ready` |
| `skippedIncoherent` | Mixed/invalid handoff skipped at load |
