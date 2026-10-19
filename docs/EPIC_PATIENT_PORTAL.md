# Epic 6 — Patient Portal

Product Platform. Independent of v5.0. Consumes Patient Care Continuity. Does not modify Core.

## Objective

Consulta READ ONLY de un Encounter clínico certificado, en perspectiva de paciente.

## Dependencies

READ ONLY: `ContinuityPackage` (Completion y Settlement ya resueltos como slices).

## Read Model

`PortalEncounterView`. Documento solo si `deliveredAt != null`. Comercial informativo. `unavailable` si PCC no deriva.

## No Writes

No workflows Core. No modifica Encounter. No paga. No entrega. No toca portal legado.

## PASS

PP-1 … PP-12

## Metrics

- `portalEncounterAvailable`
- `portalHandoffPresent`
- `portalDocumentDelivered`
- `portalDocumentKind`
- `portalCommerciallyPaid`

Surface: `/portal/encounter/[encounterId]`
