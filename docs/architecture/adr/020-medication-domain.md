# ADR-020: Medication Domain

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-08-08 |
| **Authors** | Architecture / Product |
| **Reviewers** | SAVAC-HeyDoctor · Product Owner |
| **Phase / initiative** | Enterprise Prescription Builder · Medication Domain |
| **Related** | [`PRESCRIPTION-ENGINE-ENTERPRISE-PHASE-0-CLINICAL-DESIGN.md`](../PRESCRIPTION-ENGINE-ENTERPRISE-PHASE-0-CLINICAL-DESIGN.md), Implementation Blueprint (EPIC 1), Encounter Shell SSOT |

---

## Clinical Principle

> **MedicationOrder** is the single source of truth for every medication-related workflow in HeyDoctor.
>
> All UI, PDF, FHIR, Clinical AI and Marketplace projections MUST derive from the Medication Domain.
>
> No clinical workflow may reconstruct medication semantics from concatenated strings.

Este principio es **vinculante** para P0+ y para cualquier proyección futura (Hospitalización, Urgencias, Orders, ePrescription, FHIR, Clinical AI).

---

## Purpose

Establecer el **Medication Domain** como arquitectura oficial de HeyDoctor para cualquier acto farmacológico en la plataforma.

El dominio es el SSOT clínico. UI, PDF, Orders, Hospitalización, Urgencias, Marketplace, FHIR, ePrescription y Clinical AI son **consumidores o proyecciones** del dominio — nunca al revés.

**Prohibido:** concatenación de strings (`dosage + ", " + frequency`) como fuente de verdad clínica.

---

## Scope

### In scope

- Cadena clínica:
  ```
  MedicationCatalog
    → MedicationProduct
      → MedicationOrder
        → MedicationDispense
          → MedicationAdministration
  ```
- Posología estructurada (dosis, frecuencia, duración, vía, timing).
- Catálogos controlados por jurisdicción (CL, CO, US, ES, futuros).
- Builder ambulatorio (Prescription / Orders) sobre este dominio.
- Contratos FE para proyección PDF, FHIR draft, Clinical AI proposals.
- Migración desde `SelectedMedication` / `MedicationItem` (strings) vía adapters.

### Out of scope (este ADR)

- EPIC 2 (persistencia de antecedentes).
- Cambios de Encounter Runtime / Memory / Snapshot / Full Record.
- Implementación de backend / PDF Nest en la decisión misma (se autoriza en fase BE dedicada).
- eMAR hospitalario completo (evolución futura sobre los mismos aggregates).

---

## Ubiquitous Language

| Término | Definición |
|---|---|
| **MedicationCatalog** | Conocimiento farmacéutico versionable por jurisdicción (presentaciones, formas, vías, vocabularios de posología). |
| **MedicationProduct** | Producto/presentación dispensable seleccionable (INN, fuerza, forma, vía usual, `drugPresentationId`). |
| **MedicationOrder** | Aggregate de intención terapéutica de medicar a un paciente en un contexto clínico. |
| **MedicationOrderLine** | Una línea = una intención terapéutica (producto + posología + instrucciones). |
| **StructuredPosology** | Dosis, frecuencia, duración, vía y timing tipados (codes + quantities). |
| **MedicationDispense** | Acto de dispensación / suministro (farmacia u hospital). |
| **MedicationAdministration** | Acto de administración al paciente (p. ej. eMAR). |
| **IssueSnapshot** | Congelación inmutable de producto + posología al emitir. |
| **PosologyRenderer** | Único productor de texto/bloques clínicos a partir del dominio. |
| **Projection** | Representación derivada (PDF, FHIR, print, marketplace) — no SSOT. |
| **Jurisdiction** | Parámetro de país/mercado (`CL`, `CO`, `US`, `ES`, …); el motor no asume un solo país. |
| **careSetting** | Ámbito: `AMBULATORY` \| `HOSPITAL` \| `ED` \| `HOME` \| `TELEHEALTH` \| `MARKETPLACE`. |
| **OrderPriority** | Urgencia clínica: `ROUTINE` \| `ASAP` \| `STAT` (STAT ≠ frecuencia). |
| **EffectivePeriod** | Vigencia / inicio planificado (`startAt` / `endAt`); `scheduledStartAt` como atajo. |
| **TherapyLineage** | Linaje terapéutico: `priorOrderId`, `replacesOrderId`, `reconcileAction`. |
| **ReconcileAction** | Decisión de reconciliación: `continue` \| `stop` \| `modify`. |
| **suspended / on_hold** | Estados de retención temporal — distintos de `cancelled`. |

---

## Aggregates

| Aggregate | Responsabilidad | Notas |
|---|---|---|
| **MedicationCatalog** | Resolver productos y vocabularios por jurisdicción | Read-model / knowledge |
| **MedicationOrder** | Ciclo de vida de la orden (incl. hold/suspensión, prioridad, vigencia, linaje) | Aggregate raíz de prescripción/órdenes |
| **MedicationDispense** | Dispensación vinculada a una orden/línea | Fase hospitalaria / farmacia |
| **MedicationAdministration** | Administración documentada | Fase eMAR / FHIR |

**MedicationProduct** es entidad de catálogo (o snapshot dentro de la línea), no un aggregate de escritura clínica independiente.

Estados de `MedicationOrder` (resumen):  
`drafting` → `safety_review` → `ready_to_issue` → `issued` → (`amended` \| `suspended` \| `on_hold` \| `cancelled`).

---

## Value Objects

| VO | Contenido mínimo |
|---|---|
| `DoseFormCode` | Forma farmacéutica (comprimido, jarabe, ampolla, …) |
| `DoseAmount` | `{ amount, unit, formUnit? }` |
| `FrequencySpec` | Código + parámetros (c/Nh, N×/día, semanal, custom) |
| `DurationSpec` | N días/semanas/meses \| continuo \| hasta nueva orden |
| `RouteCode` | Oral, IV, IM, SC, … (alineable FHIR) |
| `TimingInstructionCode` | Con alimentos, PRN, en ayunas, … |
| `JurisdictionCode` | CL, CO, US, ES, … |
| `OrderPriority` | `ROUTINE` \| `ASAP` \| `STAT` |
| `EffectivePeriod` | `{ startAt?, endAt? }` |
| `TherapyLineage` | `{ priorOrderId?, replacesOrderId?, reconcileAction? }` |
| `ReconcileAction` | `continue` \| `stop` \| `modify` |
| `QuantitySpec` | Cantidad a dispensar / ciclo |
| `IssueSnapshot` | Producto + posología congelados al emitir |
| `StructuredPosology` | Composición de dose + frequency + duration + route + timing (+ asNeeded) |

---

## Invariants

1. **Domain-first:** ninguna proyección redefine la clínica.
2. **Una línea = una intención terapéutica.**
3. **Posología estructurada** obligatoria para emisión; free-text solo como override auditado.
4. **Al emitir:** se congela `IssueSnapshot` (cambios de catálogo no mutan historia).
5. **Un solo renderer:** texto clínico sale de `PosologyRenderer`, nunca de `join` ad hoc.
6. **Physician in control:** Clinical AI sugiere (`PROPOSAL`); no emite solo.
7. **Country-independent:** jurisdicción es parámetro.
8. **Cadena ordenada:** Catalog → Product → Order → Dispense → Administration; no saltar eslabones semánticos.
9. **Encounter Isolation:** este bounded context no remonta Runtime/Memory/Snapshot del Encounter Shell.
10. **STAT is priority:** `OrderPriority.STAT` — nunca frecuencia/timing CUSTOM.
11. **Suspension ≠ cancellation:** `suspended` / `on_hold` son retención temporal; `cancelled` es anulación.
12. **Lineage is relational:** `TherapyLineage` no sustituye el aggregate; expresa continuidad terapéutica.

---

## Bounded Context

**Nombre:** Medication Domain (HeyDoctor Clinical Platform)

| Relación | Contexto | Integración |
|---|---|---|
| Upstream | Clinical Catalog / smart-suggestions APIs | `MedicationProduct` |
| Downstream | Ambulatory Prescription UI, Orders Hub | `MedicationOrder` Builder |
| Downstream | PDF / print | Projection (adapter → API actual; BE tipado en fase autorizada) |
| Downstream | FHIR / ePrescription | Mappers desde Domain |
| Downstream | Hospital / ED / Marketplace | Mismo Domain, distinto `careSetting` / intent |
| Downstream | Clinical AI / Copilot | Propuestas Domain-native (HITL) |
| Anti-corruption | Legacy `MedicationItem` / `SelectedMedication` | Adapters temporales |
| Separado | Encounter Shell, Patient Profile, Antecedentes (EPIC 2) | Sin acoplamiento de persistencia |

---

## Future Evolution

| Fase | Evolución |
|---|---|
| **P0** | Domain + catalogs + renderer + PosologyFields |
| **P0.1** | OrderPriority · suspended/on_hold · effectivePeriod · TherapyLineage (domain-only) |
| **P1–P2** | Builder ambulatorio + bridge a DTO legacy |
| **P3** | Contratos FE `MedicationDispense` / `MedicationAdministration`; seams Hospital/ED |
| **P4** | FHIR `MedicationRequest` (+ dispense/admin cuando aplique) |
| **P5** | Clinical AI Domain-native |
| **P6** | Backend: DTO tipado + PDF Projection alineada a `PosologyRenderer` |
| **Luego** | eMAR, ePrescription nacional, Marketplace feed desde Product/Order |

La cadena completa permanece estable; se implementan eslabones progresivamente sin cambiar el lenguaje ubicuo.

---

## Context

El Prescription Engine (PR-1..PR-3) ya separa catálogo, composer y calculation, pero la persistencia/PDF aún tratan dosis/frecuencia como strings concatenables. Producto exige un dominio reutilizable para toda la plataforma, no un fix aislado de PDF.

## Decision

### D1 — Medication Domain es arquitectura oficial

Adoptar la cadena Catalog → Product → Order → Dispense → Administration como SSOT del acto farmacológico.

### D2 — Prohibición de concatenación como SSOT

Cualquier UI o proyección nueva debe consumir `StructuredPosology` + `PosologyRenderer`.

### D3 — Implementación por Blueprint

P0+ sigue el Implementation Blueprint aprobado; feature-flag hasta parity Orders/Panel; sin tocar EPIC 2 ni Encounter Runtime.

### D4 — Backend diferido

Cambios Nest/PDF tipados requieren autorización explícita (P6); P0–P1 son FE + adapters.

### D5 — P0.1 clinical completeness (Accepted)

El núcleo de `MedicationOrder` incluye, sin workarounds semánticos:

1. `OrderPriority` (`ROUTINE` \| `ASAP` \| `STAT`)
2. Lifecycle `suspended` / `on_hold` (≠ `cancelled`)
3. `effectivePeriod` / `scheduledStartAt`
4. `TherapyLineage` (`priorOrderId`, `replacesOrderId`, `reconcileAction`)

## Alternatives considered

| Alternative | Pros | Cons | Rejection reason |
|---|---|---|---|
| Solo arreglar `formatMedicationLine` en BE | Rápido para PDF | No sirve Hospital/FHIR/AI; UI sigue free-text | No cumple dominio reutilizable |
| Mantener `SelectedMedication` como SSOT | Menos migración | Strings + Obs concatenadas; no FHIR-ready | Rechazado por Product |
| Generar PDF solo en cliente | Control FE | Diverge de emisión legal/server; duplica verdad | Emisión sigue server-side |

## Consequences

### Positive

- Un lenguaje clínico único en toda la plataforma.
- PDF/FHIR/AI como proyecciones consistentes.
- Migración gradual con adapters.

### Negative / debt

- Dual-run Domain ↔ `MedicationItem` hasta P6.
- PDF legacy puede seguir ambiguo hasta fase BE.

### Risks mitigated

- Ambigüedades tipo `"1, 8 HORAS"`.
- Scope creep sin bounded context.
- AI escribiendo free-text no auditable.

## Compliance and verification

- PRs del Builder referencian `Implements ADR-020`.
- Ningún PR nuevo introduce `join` de posología como SSOT.
- Índice ADR actualizado; estado **Accepted**.
- P0+ debe referenciar `Implements ADR-020`.

## References

- Prescription Engine Enterprise Phase 0 Clinical Design
- Enterprise Prescription Builder — Implementation Blueprint (EPIC 1)
- ADR-000 ADR Policy

---

## Revision history

| Date | Change | Author |
|---|---|---|
| 2026-08-08 | Creation — Proposed | Architecture |
| 2026-08-08 | Add binding Clinical Principle (MedicationOrder SSOT) | Product / Architecture |
| 2026-08-08 | Status → Accepted — Medication Domain frozen SSOT | Product Owner |
| 2026-08-08 | P0.1 — priority, hold/suspend, effectivePeriod, therapy lineage | Product / Architecture |
