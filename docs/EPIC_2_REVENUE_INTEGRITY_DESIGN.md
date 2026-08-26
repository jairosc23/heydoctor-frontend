# Epic 2 — Revenue Integrity Dashboard

**Type:** production design  
**Status:** design only — not authorized for implementation  
**Product Platform:** independent epic (not v1.0)  
**Date:** 2026-08-24

Core Platform and Product Platform v1.0 remain CERTIFIED and frozen. This Epic consumes existing projections. It does not create domains, identities, workflows, or states.

PRODUCT-2 contract: Objective · Dependencies · Read Model · No Writes · PASS · Metrics.

---

## 1. Alcance funcional confirmado

### Objetivo

Mostrar, a nivel de clínica, el estado del ciclo comercial **ya certificado** de cada Encounter `signed` o `locked`, derivado solo de Clinical Operations Projection (que ya incorpora Commercial Settlement).

El tablero no cobra, no emite boleta, no bloquea y no repara. Clasifica y cuenta. La acción operativa es abrir la ficha certificada.

### Problema que resuelve

Settlement y su UI viven **dentro de una ficha**. Nadie ve el funnel del centro: firmado impago, pagado sin comprobante, boleteado sin lock, lock anómalo, cierre comercial coherente. Facturación habla de montos de invoice, no de este ciclo. Delivery Queue habla de documentos clínicos, no de caja.

### Usuarios principales

Recepción, administración, facturación, gerencia. El médico es usuario secundario (consulta, no cobro).

### Casos de uso prioritarios

1. Cierre de caja: listar `signed` + no pagado.
2. Pago verificado sin comprobante.
3. Comprobante emitido, Encounter aún no `locked` / Settlement aún no `locked`.
4. Detectar `lockAnomaly` (CS-2) y no contarlo como ingreso cerrado.
5. Ver cierres comerciales coherentes (`commerciallyLocked`).

---

## 2. Modelo funcional

### Qué representa

Una **proyección efímera de producto**: conjunto de filas y métricas calculadas en el momento de la carga a partir de N `ClinicalOperationsView` (un `asOf` por Encounter).

Cada fila es un Encounter del recorte `signed | locked`, clasificado en **un** cubo comercial exclusivo.

Identidades: solo `EncounterId` y, si existe, `SettlementId` del Core. Ninguna identidad nueva.

### Qué NO representa

- No es Commercial Settlement (no es el workflow ni su UI de ficha).
- No es Facturación CLP (`/panel/facturacion`).
- No es Clinical Delivery Queue.
- No es fuente de verdad. No se persiste.
- No es un estado más del Encounter ni del Settlement.
- No es continuidad clínica ni Completion.

### Relación con el Core

```
Encounter (id, status)          [lectura para enumerar signed/locked]
        └── ClinicalOperationsView (asOf)
                ├── encounter.status
                └── settlement { settlementId, state, isPaid, invoiceId, lockAnomaly }
                        └── RevenueIntegrityItem + Metrics   [solo producto]
```

Commercial Settlement no se llama como workflow. Se lee **ya proyectado** en el slice `settlement` de COD.

Completion / Continuity / Delivery Queue **no se leen**.

### Delivery Queue permanece independiente

| | Clinical Delivery Queue (v1.0) | Revenue Integrity (Epic 2) |
|--|-------------------------------|----------------------------|
| Pregunta | ¿El acto vigente está `document_ready` y no entregado? | ¿El Encounter firmado cerró el ciclo comercial? |
| Clave | `EncounterId` + `ClinicalActId` | `EncounterId` (+ `SettlementId` si present) |
| Membresía | clínica | comercial |
| Pago | no filtra | define el cubo |
| Entrega | define la cola | ignorada |

Un Encounter puede estar en una, en la otra, en ambas o en ninguna. Las métricas no se mezclan. Las rutas no se comparten. El código de v1.0 no se modifica.

---

## 3. Read Model

Nombre: `RevenueIntegrityDashboard`  
Naturaleza: proyección pura de producto. Misma lista de COD views → mismo tablero.

### Entrada

1. Enumerar `EncounterId` con status `signed` o `locked` (lectura Encounter, mismo patrón que v1.0).
2. Por cada id: `loadClinicalOperationsView` (READ ONLY).
3. Ignorar Completion en la clasificación (aunque venga en la vista).

No `ensureSettlement` / `observeCommercialSettlement` / `initiateCommercialPayment` / `persistSettlementAtomic`.  
No LocalStorage, Session, Browser ni reloj para **clasificar**. `asOf` = el de cada vista COD.

Sin persistencia. Sin cache como fuente de verdad. Recalcular en cada carga.

### Fila

```
RevenueIntegrityItem
  encounterId
  settlementId          // null si settlement absent
  asOf                  // de la ClinicalOperationsView
  encounterStatus       // signed | locked | …
  settlementState       // pending | payment_initiated | payment_verified | invoiced | locked | null
  isPaid
  invoiceId             // null si no hay comprobante
  lockAnomaly           // flag COD
  bucket                // exclusivo; ver §5
```

### Tablero

```
RevenueIntegrityDashboard
  kind: "revenue_integrity_dashboard"
  items: RevenueIntegrityItem[]
  metrics: { … PRODUCT-1 … }
```

Clasificación: función pura `classifyRevenueIntegrity(view) → item`.  
Agregación: función pura `projectRevenueIntegrityDashboard(views) → dashboard`.

Un EncounterId duplicado con distinto `SettlementId` o distinto bucket → error de producto (no mezclar). No se acuña Settlement.

Settlement absent + `signed` → cubo `signed_unpaid` (`settlementId: null`). No se inventa `SettlementId`.

---

## 4. Superficies de producto

Solo Product Platform, **nuevas**:

| Superficie | Rol |
|------------|-----|
| `lib/product-platform/revenue-integrity/**` | Read model, métricas, contrato PRODUCT-2, tests |
| `docs/EPIC_REVENUE_INTEGRITY_DASHBOARD.md` | Contrato del Epic (al implementar) |
| `/panel/integridad-ingresos` | Página nueva. Lista + métricas. Enlace a `/panel/consultas/{encounterId}` |

No hay ítem de sidebar: `PanelLayout` está congelado (igual que v1.0 y `/panel/entrega-clinica`).

**No reutilizar ni modificar**

- RC-19A (listado, overflow, overlay, FAB, `page.tsx` D1/D17/D18/D19)
- `CommercialSettlementSection` / mount en `EncounterClosureSection`
- Clinical Completion y su UI
- Clinical Delivery Queue (`lib/product-platform/clinical-delivery-queue/**`, `/panel/entrega-clinica`, su contrato)
- `PanelLayout`, sidebar
- Encounter UI / overflow
- `/panel/facturacion`

La ficha certificada permanece el único lugar para pagar, emitir comprobante u observar lock.

---

## 5. Estados que debe visualizar

Un **bucket exclusivo** por fila (primera regla que coincida). Campos crudos (`encounterStatus`, `settlementState`, `isPaid`, `lockAnomaly`) se muestran siempre, para no ocultar inconsistencias.

Definiciones (`enc` = `view.encounter`, `s` = `view.settlement`; `isPaid` = `s.present && s.isPaid`; si settlement absent, `isPaid = false`).

| Bucket | Predicado sobre una `ClinicalOperationsView` | Qué ve el usuario |
|--------|-----------------------------------------------|-------------------|
| **lock_anomaly** | `enc.status === "locked"` y `!isPaid` | Encounter locked sin pago verificado (CS-2). Incluye `s.lockAnomaly` o settlement absent. |
| **commercially_locked** | `isPaid` y `enc.status === "locked"` y `s.state === "locked"` y `!s.lockAnomaly` | Cierre comercial coherente. |
| **invoiced** | `isPaid` y `s.invoiceId != null` y `s.state !== "locked"` | Comprobante existe; lock comercial aún no. Cubre `invoicedUnlocked`. |
| **payment_verified** | `isPaid` y `s.invoiceId == null` | Pago verificado, sin comprobante. |
| **signed_unpaid** | `enc.status === "signed"` y `!isPaid` | Firmado impago (pending, payment_initiated, o settlement absent). |
| **unclassified** | Resto del recorte (no debería si el scan es solo signed/locked) | Visible como excepción; no suma a cubos de integridad. |

**Mapeo pedido en el alcance**

| Pedido | Diseño |
|--------|--------|
| signed + unpaid | bucket `signed_unpaid` |
| payment_verified | bucket `payment_verified` |
| invoiced | bucket `invoiced` (= invoiced unlocked) |
| locked | no es un cubo único: se muestra `encounterStatus` y `settlementState`. Encounter locked + pagado + settlement locked = `commercially_locked`. Encounter locked + no pagado = `lock_anomaly`. |
| lockAnomaly | bucket `lock_anomaly` |
| commerciallyLocked | bucket `commercially_locked` |

`payment_initiated` sin `isPaid` cae en `signed_unpaid`, no en `payment_verified`.  
`?payment=` no se lee.

---

## 6. Métricas PRODUCT-1

Derivadas **solo** del conjunto de `RevenueIntegrityItem` (a su vez solo de COD). Sin escribir el Core. Sin reloj.

| Métrica | Derivación |
|---------|------------|
| `signedUnpaidCount` | ítems con `bucket === "signed_unpaid"` |
| `verifiedWithoutInvoiceCount` | ítems con `bucket === "payment_verified"` |
| `invoicedUnlockedCount` | ítems con `bucket === "invoiced"` |
| `lockAnomalyCount` | ítems con `bucket === "lock_anomaly"` |
| `commerciallyLockedCount` | ítems con `bucket === "commercially_locked"` |

Complementarias (operacional, no mezclar con v1.0):

| Métrica | Derivación |
|---------|------------|
| `encountersScanned` | vistas COD consideradas |
| `settlementAbsentCount` | `signed_unpaid` con `settlementId == null` |
| `unclassifiedCount` | `bucket === "unclassified"` |

Invariantes:

- `lockAnomalyCount` no incrementa `commerciallyLockedCount`.
- Encounter `locked` + `!isPaid` → solo `lockAnomalyCount`.
- Las métricas de Delivery Queue no aparecen.

---

## 7. Riesgos

**Duplicidad con Settlement**  
El tablero no replica pagar / verificar / invoice / lock. Solo clasifica slices COD. Acción = navegar a la ficha. Riesgo residual: copy que invite a “cerrar” desde el tablero. Mitigación: CTA único “Abrir consulta”.

**Duplicidad con Facturación**  
Facturación = invoices y CLP. Este Epic = estados de Settlement por Encounter. No montar en `/panel/facturacion`. No usar `fetchInvoiceDashboard` como fuente.

**Duplicidad con Delivery Queue**  
Módulos, rutas, métricas y membresía separados. Prohibido importar `projectClinicalDeliveryQueue` o filtrar por `document_ready` / `deliveredAt`.

**Inconsistencias Encounter vs Settlement**  
Existen por diseño (CS-2, lock por webhook). El read model las **exhibe** (`lock_anomaly`, campos crudos). No las repara. No llama workflows para “alinear”.

**Snapshots desactualizados**  
COD lee el snapshot de Settlement del Core (local al cliente) + Encounter API. Puede haber desfase vs. webhook. Mitigación: recalcular cada carga; `asOf` visible por fila; no cache persistente. No “refrescar” con `observeCommercialSettlement` (eso sería write/workflow).

**Interpretación incorrecta de lockAnomaly**  
No es “ya cobrado”. No es `commercially_locked`. No es un lock clínico del acto. Es Encounter `locked` sin `isPaid`. El cubo y la métrica van apartados. UI: alerta, no badge de éxito.

---

## 8. Criterios objetivos de PASS

### Funcionales

| ID | Criterio |
|----|----------|
| REV-1 | `signed` + `!isPaid` → `signed_unpaid`, no `commercially_locked`. |
| REV-2 | `lockAnomaly` / Encounter `locked` + `!isPaid` → `lock_anomaly`; no se repara. |
| REV-3 | Encounter `locked` + `!isPaid` no incrementa `commerciallyLockedCount`. |
| REV-4 | `isPaid` sin `invoiceId` → `payment_verified`; con `invoiceId` y settlement no `locked` → `invoiced`; `isPaid` + Encounter `locked` + settlement `locked` → `commercially_locked`. |
| REV-5 | Completion / `deliveredAt` / Delivery Queue no cambian el bucket. |
| REV-8 | Métricas §6 presentes. Contrato PRODUCT-2 completo. |
| REV-9 | Mismas vistas COD → mismo dashboard (determinista). |

### Arquitectónicos

| ID | Criterio |
|----|----------|
| REV-6 | Cero writes: no `initiate*` / `observe*` / `persist*` / `save*` / `ensure*` / `run*`. |
| REV-7 | Sin identidad nueva. Ítem = `EncounterId` (+ `SettlementId` si present). |
| REV-10 | Sin persistencia, LocalStorage, Session ni cache como fuente de verdad. |
| REV-11 | Sin imports de Delivery Queue, Settlement UI, Completion UI, PanelLayout, facturación, overflow, listado. |
| REV-12 | Superficie de producto nueva; ficha Core intacta. |

Certificación futura del Epic: REV-1…REV-12 PASS, sin tocar baselines congeladas.

---

## 9. Exclusiones explícitas

No se modifican:

- `CORE_PLATFORM`
- `ARCHITECTURE_BASELINE`
- Product Platform v1.0 (Clinical Delivery Queue y su contrato)
- RC-19A
- Clinical Completion
- Commercial Settlement
- Clinical Operations Projection
- Patient Care Continuity
- Clinical Delivery Queue

Además:

- Sin nuevos dominios.
- Sin nuevas identidades.
- Sin nuevos workflows.
- Sin writes.
- Sin persistencia.
- Sin backend.
- Sin cambios de estados existentes (Encounter y Settlement conservan los ya certificados).

---

## Contrato PRODUCT-2 (resumen)

| Sección | Contenido |
|---------|-----------|
| Objective | Visualizar el funnel comercial certificado por Encounter, a nivel de clínica. |
| Dependencies | READ ONLY: enumeración Encounter `signed`/`locked` + `loadClinicalOperationsView`. Settlement solo vía slice COD. |
| Read Model | `RevenueIntegrityDashboard` efímero; buckets exclusivos §5; métricas §6. |
| No Writes | No workflows Core. Acción = abrir ficha certificada. |
| PASS | REV-1…REV-12 |
| Metrics | `signedUnpaidCount`, `verifiedWithoutInvoiceCount`, `invoicedUnlockedCount`, `lockAnomalyCount`, `commerciallyLockedCount` |

---

**Siguiente paso:** aprobación explícita de este diseño. Hasta entonces no hay implementación.
