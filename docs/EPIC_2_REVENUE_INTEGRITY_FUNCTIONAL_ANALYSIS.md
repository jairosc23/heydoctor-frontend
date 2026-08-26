# Epic 2 — Revenue Integrity Dashboard

**Type:** functional analysis (pre-design)  
**Status:** not authorized for design or implementation  
**Product Platform:** v1.0 remains CERTIFIED and frozen  
**Date:** 2026-08-24

This document does not change Core Platform, Architecture Baseline, or Product Platform v1.0.

**Recommendation:** Epic 2 **must exist as an independent Product Platform epic**. It must not be absorbed into Clinical Delivery Queue or into Commercial Settlement.

---

## 1. Objetivo funcional del Epic

Exponer, en una sola vista de producto, el **funnel comercial ya certificado** de los Encounter firmados:

- `signed` y no pagado
- `payment_verified` sin comprobante
- `invoiced` sin lock comercial
- `lockAnomaly` (Encounter `locked` sin pago verificado)

El Epic no cobra, no factura, no bloquea y no repara. Solo **lee** el estado comercial proyectado por el Core y lo agrega a nivel de clínica.

La continuidad clínica y la entrega de documentos **no** forman parte de este Epic.

---

## 2. Inventario de capacidades existentes (ciclo comercial)

### Encounter

- Ciclo: `draft → in_progress → completed → signed → locked`.
- Pago permitido solo en `signed` (`resolveCanPay`).
- UI de pago en la ficha de un Encounter (sesión Payku, `?payment=` no es verdad).
- No existe un listado clínico-comercial de funnel. El listado de consultas está congelado (RC-19A) y no muestra `isPaid`, `lockAnomaly` ni estados de Settlement.

### Commercial Settlement (Core, CERTIFIED, congelado)

- Identidad: `SettlementId` (un Encounter).
- Estados: `pending → payment_initiated → payment_verified → invoiced → locked`.
- Verificación: `isPaid` en API, no query string.
- Invoice después de pago verificado; lock **observado**, no disparado por el frente.
- `lockAnomaly` cuando Encounter figura `locked` sin `isPaid`.
- UI: `CommercialSettlementSection` **dentro de una ficha**. Un actor debe abrir cada consulta.
- No hay tablero multi-Encounter. No hay métricas de clínica. No hay cola de impagos.

### Clinical Operations Projection (Core, CERTIFIED, congelado)

- Vista de un `EncounterId` en un `asOf`.
- Incluye slices de Encounter, Completion y Settlement (`isPaid`, `invoiceId`, `lockAnomaly`, audit).
- Es proyección pura, sin persistencia.
- No agrega N Encounter. No clasifica el funnel. No es un dashboard.

### Product Platform v1.0 — Clinical Delivery Queue (CERTIFIED, congelada)

- Objetivo: actos en `document_ready` **sin entregar**.
- Clave: `EncounterId` + `ClinicalActId` vigente.
- Membresía **clínica**. El pago **no** saca un ítem de la cola.
- Métricas: entregas pendientes, recetas/resúmenes, omitidos clínicos.
- Superficie: `/panel/entrega-clinica`.
- **No** lista impagos, **no** lista `lockAnomaly`, **no** distingue `payment_verified` / `invoiced` / lock comercial.

### Fuera del Epic pero relacionado

- `/panel/facturacion`: dashboard de **facturas** (ingresos, pending/paid de invoice). No está anclado a estados de Settlement ni a `lockAnomaly`. No es el funnel Encounter → pago → comprobante → lock.
- Continuity Package: handoff clínico. Irrelevante para integridad de ingresos.

---

## 3. Análisis de duplicidad

| Capacidad | ¿Ya existe? | ¿Dónde? | ¿Reutilizar? |
|-----------|-------------|---------|--------------|
| Pagar / verificar / facturar / observar lock en **una** ficha | Sí | Commercial Settlement UI + workflow | No reimplementar. La ficha sigue siendo el lugar de acción. |
| Proyectar `isPaid`, `invoiceId`, `lockAnomaly`, `state` de un Encounter | Sí | COD (`settlement` + `encounter`) | **Sí. Única fuente de lectura.** |
| Cola de documentos no entregados | Sí | Product Platform v1.0 | **No usar.** Membresía distinta. |
| Funnel comercial multi-Encounter (impago, sin boleta, sin lock, anomalía) | **No** | — | Este es el hueco del Epic 2. |
| Tablero de facturas CLP | Parcial | `/panel/facturacion` | No sustituye. Invoices ≠ Settlement state. |

**Qué reutilizar (solo lectura):** `loadClinicalOperationsView` / slice `settlement` + `encounter`. Enumeración de `EncounterId` (`signed` / `locked`) igual que el patrón de lectura de Epic 1, sin escribir Encounter.

**Qué no reutilizar como fuente:** Clinical Delivery Queue, Continuity Package, Completion, workflows `observe*` / `initiate*` / `persist*` de Settlement.

**Confirmación de no duplicidad**

- **No duplica Product Platform v1.0.** v1.0 responde “¿qué acto clínico no se entregó?”. Epic 2 responde “¿qué Encounter firmado no cerró el ciclo comercial?”. Un Encounter puede estar en una cola, en la otra, en ambas o en ninguna (p. ej. entregado e impago, o pagado y no entregado).
- **No duplica Commercial Settlement.** Settlement **ejecuta y muestra** el ciclo en la ficha. Epic 2 **agrega** estados ya proyectados. No crea `SettlementId`, no cambia estados, no inicia pago, no emite invoice, no fuerza lock.

**Conclusión de existencia:** debe ser un **Epic independiente** de Product Platform (v1.1 candidata), no un anexo de v1.0 ni una extensión del dominio Settlement.

Absorberlo en Clinical Delivery Queue mezclaría membresía clínica y comercial, contradiría PCC-Q2 / PCC-5 y contaminaría las métricas PRODUCT-1 de entrega.

---

## 4. Casos de uso reales

1. **Cierre de caja del día.** Administración ve cuántos Encounter `signed` siguen sin `isPaid` sin abrir fichas.
2. **Pago verificado, sin boleta.** Facturación recupera `payment_verified` sin `invoiceId` (hueco operacional post-Payku).
3. **Boleta emitida, lock no observado.** Gerencia ve `invoiced` + Encounter aún `signed` (webhook/lock pendiente), distinto de impago.
4. **Anomalía de lock.** Un Encounter `locked` con `!isPaid` no se cuenta como cierre comercial (CS-2). Hay que verlo, no “arreglarlo”.
5. **Recepción no cobra en la ficha clínica.** Pide una cola comercial para llamar al paciente o reenviar pago, sin entrar al acto clínico.
6. **Médico no es dueño del cobro.** Sigue atendiendo; el tablero no le exige `isPaid` para entregar documentos (eso es v1.0).

---

## 5. Actores

| Actor | Uso del Epic | No es |
|-------|----------------|-------|
| **Médico** | Consulta opcional: “esta visita quedó impaga / anómala”. No opera el cobro aquí. | No es su cola de entrega (eso es v1.0). |
| **Recepción** | Lista de firmadas impagas para gestionar cobro o recontacto. | No inicia Payku desde un workflow nuevo; abre la ficha certificada si hay que pagar. |
| **Administración** | Funnel del centro: atascos entre pago, boleta y lock. | No repara `lockAnomaly`. |
| **Facturación** | Prioriza `payment_verified` sin comprobante y `invoiced` no locked. | No sustituye `/panel/facturacion` de montos CLP. |
| **Gerencia** | Indicadores de integridad de ingresos y anomalías CS-2. | No es un P&L contable. |

---

## 6. Valor esperado

**Clínico**  
Separar “acto cerrado / documento pendiente” de “caja pendiente”. El médico no retrasa la entrega por impago. La clínica no confunde lock comercial con cierre clínico.

**Operacional**  
Recepción, administración y facturación trabajan un backlog comercial **sin** recorrer fichas. Se ven tres atascos distintos (impago vs. sin boleta vs. sin lock) más anomalías.

**Financiero**  
Visibilidad de Encounter firmados no cobrados y de pagos verificados sin comprobante. Reduce fugas entre Payku, invoice y lock. No genera el cobro; reduce el tiempo a detectarlo.

---

## 7. Dependencias (solo lectura)

El Epic, si se autoriza, consume **únicamente**:

| Fuente | Modo | Uso |
|--------|------|-----|
| Clinical Operations Projection | READ ONLY | `encounter.status`, `settlement.state`, `isPaid`, `invoiceId`, `lockAnomaly`, `asOf` |
| Commercial Settlement | READ ONLY vía COD (snapshot ya proyectado) | No llamar `ensureSettlement`, `observeCommercialSettlement`, `initiateCommercialPayment`, `persistSettlementAtomic` |

Sin writes. Sin workflows. Sin persistencia de un “RevenueIntegrityView” como fuente de verdad.

Enumerar `EncounterId` (`signed` / `locked`) es lectura de Encounter, igual que v1.0; no escribe el ciclo Encounter.

**No consume:** Clinical Completion, Patient Care Continuity, Clinical Delivery Queue, Payku write, invoice write.

---

## 8. Riesgos funcionales y arquitectónicos

| Riesgo | Tipo | Mitigación (en diseño futuro) |
|--------|------|--------------------------------|
| Absorber el Epic en v1.0 y mezclar colas | Funcional | Rechazado en §3. Epic independiente. |
| Reimplementar Settlement en el tablero (pagar / facturar / lock) | Arquitectónico | Solo lectura; acción = navegar a ficha certificada. |
| Tratar `?payment=` o facturas CLP como verdad del funnel | Funcional | Membresía = COD `isPaid` / `state` / `lockAnomaly`. |
| Contar `locked` + `!isPaid` como cierre | Funcional (CS-2) | Cubo `lockAnomaly` aparte; no entra en “cerrado”. |
| Persistencia de la cola comercial | Arquitectónico | Recalcular desde COD en cada carga. |
| Quinta identidad (`RevenueId`) | Arquitectónico | Clave = `EncounterId` + `SettlementId` ya existentes. |
| Montar en listado de consultas o `page.tsx` | Arquitectónico (RC-19A) | Superficie de producto nueva, como `/panel/entrega-clinica`. |
| Usar Continuity / Completion como filtro | Funcional | Prohibido. Independencia clínica/comercial. |
| Modificar `lib/commercial-settlement` o COD | Arquitectónico | Consume APIs públicas de lectura; no edita Core. |

---

## 9. Métricas PRODUCT-1

Medibles sobre un recálculo de solo lectura (sin reloj que altere la membresía):

| Métrica | Valor que mide |
|---------|----------------|
| `encountersScanned` | Cobertura operacional del recorte |
| `signedUnpaidCount` | Fuga de cobro (`signed` + `!isPaid`) |
| `verifiedWithoutInvoiceCount` | Pago verificado sin comprobante |
| `invoicedUnlockedCount` | Comprobante sin lock observado |
| `lockAnomalyCount` | Integridad CS-2 (no es ingreso cerrado) |
| `commerciallyLockedCount` | Cierres comerciales coherentes (`isPaid` + Encounter `locked` + settlement `locked`) |
| `settlementAbsentCount` | Firmados sin snapshot comercial (hueco operacional, no mint) |

No incluir `pendingDeliveryCount` ni métricas de `ClinicalActId`. Esas pertenecen a v1.0.

---

## 10. Criterios objetivos de PASS (para un diseño futuro)

| ID | Criterio |
|----|----------|
| REV-1 | `signed` + `!isPaid` aparece como impago, no como cierre comercial. |
| REV-2 | `lockAnomaly` es visible y no se repara ni se reclasifica como locked comercial. |
| REV-3 | Encounter `locked` + `!isPaid` no incrementa `commerciallyLockedCount`. |
| REV-4 | `payment_verified` sin `invoiceId` ≠ `invoiced` ≠ commercially locked. |
| REV-5 | Membresía independiente de Completion / Delivery Queue / `deliveredAt`. |
| REV-6 | Cero writes: no `initiate*` / `observe*` / `persist*` / `save*` / `ensure*`. |
| REV-7 | No se acuña identidad nueva; ítem = `EncounterId` (+ `SettlementId` si present). |
| REV-8 | PRODUCT-1: las métricas de §9 están en el read model. PRODUCT-2: contrato Objective / Dependencies / Read Model / No Writes / PASS / Metrics. |
| REV-9 | Recargar sin store propio produce los mismos cubos (determinista respecto de las vistas COD de entrada). |

---

## 11. Exclusiones explícitas

- No modificar `CORE_PLATFORM`.
- No modificar `ARCHITECTURE_BASELINE`.
- No modificar Product Platform v1.0 (Clinical Delivery Queue, su contrato, su ruta, sus métricas).
- No modificar RC-19A.
- No modificar Clinical Completion.
- No modificar Commercial Settlement.
- No modificar Clinical Operations Projection.
- No modificar Patient Care Continuity.
- No crear dominios.
- No crear identidades.
- No crear workflows.
- No tocar componentes congelados.

---

## Resultado

**¿Debe existir como Epic independiente?** **Sí.**

Hay un vacío real: el ciclo comercial certificado solo es operable **ficha a ficha**, y Product Platform v1.0 cubre **entrega clínica**, no integridad de ingresos.

**¿Debe absorberse en Product Platform v1.0?** **No.** Las membresías, actores, métricas y riesgos son ortogonales. Absorberlo rompería el contrato de Clinical Delivery Queue.

El siguiente paso, si se autoriza, es **diseño** (contrato PRODUCT-2) — no implementación.
