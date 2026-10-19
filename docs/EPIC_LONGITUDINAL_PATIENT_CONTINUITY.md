# Epic 3 — Longitudinal Patient Continuity

Product Platform. Independent of v2.0. Consumes Core. Does not modify Core.

## Objective

Secuencia cronológica de actos vigentes de un paciente, en solo lectura.

## Dependencies

READ ONLY: lista Encounter por `patientId` + `loadContinuityPackage` (COD vía PCC).

## Read Model

`LongitudinalContinuityProjection`. Un paquete por Encounter. `asOf` de COD. Handoff `absent` explícito.

## No Writes

No workflows Core. Acción = abrir ficha certificada.

## PASS

LON-1 … LON-13

## Metrics

- `totalContinuityPackages`
- `activeClinicalActs`
- `absentHandOffCount`
- `deliveredDocumentCount`
- `visitSummaryCount`
- `prescriptionCount`

Surface: `/panel/continuidad-longitudinal/[patientId]`
