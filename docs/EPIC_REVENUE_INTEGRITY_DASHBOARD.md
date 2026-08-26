# Epic 2 — Revenue Integrity Dashboard

Product Platform. Independent of v1.0. Consumes Core. Does not modify Core.

## Objective

Visualizar el funnel comercial certificado por Encounter, a nivel de clínica.

## Dependencies

READ ONLY: enumeración Encounter `signed` / `locked` + `loadClinicalOperationsView`. Settlement solo vía slice COD.

## Read Model

`RevenueIntegrityDashboard` efímero. Un bucket exclusivo por Encounter:

`lock_anomaly` | `commercially_locked` | `invoiced` | `payment_verified` | `signed_unpaid`

## No Writes

No workflows Core. Acción = abrir ficha certificada.

## PASS

REV-1 … REV-12

## Metrics

- `signedUnpaidCount`
- `verifiedWithoutInvoiceCount`
- `invoicedUnlockedCount`
- `lockAnomalyCount`
- `commerciallyLockedCount`

Surface: `/panel/integridad-ingresos`
