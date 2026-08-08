# Medication Domain — Implementation Blueprint

| Field | Value |
|---|---|
| **Status** | Official (ADR-020) |
| **Clinical Principle** | `MedicationOrder` is SSOT; projections derive from Domain; no concatenated-string semantics |
| **Related** | [ADR-020](./adr/020-medication-domain.md) |

---

## Chain

```
MedicationCatalog
  → MedicationProduct
    → MedicationOrder
      → MedicationDispense
        → MedicationAdministration
```

---

## Phases

| Phase | Scope | UI | BE |
|---|---|---|---|
| **P0** | Domain types, jurisdiction catalogs, `PosologyRenderer`, `PosologyFields` / Preview, flag | Fields/Preview only | No |
| **P0.1** | Clinical completeness on `MedicationOrder` only | **No** | No |
| **P1** | `MedicationOrderBuilder` + legacy adapter + flag in Panel/Orders | Yes | No |
| **P2** | GA ambulatory; deprecate `SelectedMedication` path | Yes | No |
| **P3+** | Dispense/Admin seams, Hospital/ED, FHIR, AI | Progressive | P6 for PDF/DTO |

---

## P0.1 — Domain completeness (no UI)

Added to `MedicationOrder` core (no Builder, Orders, or backend):

| Concept | Representation |
|---|---|
| **OrderPriority** | `priority?: ROUTINE \| ASAP \| STAT` |
| **Suspension / hold** | `status: suspended \| on_hold` (≠ `cancelled`) |
| **Effective / scheduled** | `effectivePeriod?: { startAt?, endAt? }`, `scheduledStartAt?` |
| **Therapy Lineage** | `lineage?: { priorOrderId?, replacesOrderId?, reconcileAction? }` with `continue \| stop \| modify` |

### Domain QA mapping (post–P0.1)

| Workflow | Representation |
|---|---|
| Ambulatory prescription | `careSetting=AMBULATORY` + `intent=ORDER` |
| Hospital medication order | `careSetting=HOSPITAL` + Order (+ Dispense/Admin seams) |
| Emergency STAT order | `careSetting=ED` + `priority=STAT` |
| PRN medication | `posology.asNeeded` |
| Continuous treatment | `duration: CONTINUOUS` |
| Dose modification | `status=amended` + `version` / new snapshot |
| Medication suspension | `status=suspended` or `on_hold` |
| Medication renewal | `intent=REFILL` + `lineage.priorOrderId` / `replacesOrderId` |
| Medication reconciliation | `lineage.reconcileAction` + lineage ids on resulting orders |
| Future scheduled treatment | `intent=PLAN` + `scheduledStartAt` / `effectivePeriod.startAt` |

---

## Invariants (implementation)

- No clinical workflow may reconstruct medication semantics from concatenated strings.
- STAT is `OrderPriority`, never a frequency code workaround.
- Future capabilities (FHIR, ePrescription, Hospital, CDS, AI) **extend** this domain; they must not fork a parallel medication model.
