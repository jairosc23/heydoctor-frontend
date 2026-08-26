# Epic 5 — Operational Pulse Dashboard

Product Platform. Independent of v4.0. Consumes v1.0–v4.0. Does not modify Core.

## Objective

Fotografía operacional del centro, en solo lectura.

## Dependencies

READ ONLY: v1.0 cola, v2.0 dashboard, v4.0 briefs (v3.0 vía v4.0); población `patientId` por lectura Encounter `signed`/`locked`.

## Read Model

`OperationalPulseDashboard`. KPIs + `pulseStatus` + alertas + composición. Sin `asOf` de clínica.

## No Writes

No workflows Core. No modifica Encounter. Acción = abrir tableros certificados v1.0 / v2.0.

## PASS

OPD-1 … OPD-13

## Metrics

- `pulseDeliveryBacklog`
- `pulseCommercialAtRisk`
- `pulseCommercialClosed`
- `pulsePatientsScanned`
- `pulseBriefReady`
- `pulseBriefEmpty`
- `pulseLastHandoffAbsent`

Surface: `/panel/pulso-operativo`
