# Epic 4 — Pre-Visit Clinical Brief

Product Platform. Independent of v3.0. Consumes Longitudinal Patient Continuity. Does not modify Core.

## Objective

Punto de partida clínico de la próxima consulta, en solo lectura.

## Dependencies

READ ONLY: `LongitudinalContinuityProjection` (PCC y COD ya resueltos en cada ítem).

## Read Model

`PreVisitClinicalBrief`. Último ítem de la línea. `asOf` copiado. `empty` explícito.

## No Writes

No workflows Core. No modifica Encounter. Acción = abrir ficha certificada del origen.

## PASS

PVB-1 … PVB-13

## Metrics

- `briefAvailable`
- `briefEmpty`
- `sourceEncounterId`
- `sourceClinicalActPresent`
- `sourceDocumentKind`
- `sourceDelivered`
- `sourceAsOf`

Surface: `/panel/brief-previsita/[patientId]`
