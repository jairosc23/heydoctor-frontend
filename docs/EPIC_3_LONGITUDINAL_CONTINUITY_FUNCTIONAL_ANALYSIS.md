# Epic 3 — Longitudinal Patient Continuity

**Type:** functional analysis (pre-design)  
**Status:** not authorized for design or implementation  
**Date:** 2026-08-24

Core Platform and Product Platform v2.0 remain CERTIFIED and frozen. Epic 1 and Epic 2 are not modified.

**Recommendation:** Epic 3 **must exist as an independent Product Platform epic**. It must not be absorbed into v2.0 (Delivery Queue or Revenue Integrity) and must not modify Patient Care Continuity. It **reuses** `ContinuityPackage` as the unit of reading, one per `EncounterId`.

---

## 1. Objetivo funcional del Epic

Dado un paciente, proyectar la **secuencia de paquetes de continuidad** de sus Encounter (uno por `EncounterId`, acto vigente únicamente), para que el médico vea el hilo clínico entre visitas **sin** reabrir, reescribir ni persistir actos.

Responde: *¿qué actos vigentes, documentos y entregas tiene este paciente a lo largo del tiempo?*

No responde: qué falta por entregar en la clínica (Epic 1), ni qué falta por cobrar (Epic 2), ni el estado de un solo Encounter (COD / PCC).

---

## 2. Inventario de capacidades existentes

### Encounter

- Identidad `EncounterId`; `patientId` en el registro.
- Lista filtrable por `patientId` (`fetchConsultations`).
- Estados `draft → … → signed → locked`.
- Ficha de consulta congelada en chrome RC-19A (`page.tsx` D1/D17/D18/D19). Listado de consultas congelado.
- No hay línea de tiempo de actos clínicos en la ficha de paciente (`/panel/pacientes/[id]` = datos, cobertura, emergencia, antecedentes).

### Clinical Completion

- Un `ClinicalActId` vigente por Encounter; inmutable tras `document_ready` / `delivered`.
- UI de cierre en la ficha. No hay vista multi-visita.

### Commercial Settlement

- Un `SettlementId` por Encounter. Independiente del acto.
- Irrelevante como fuente de este Epic (el handoff clínico no exige pago).

### Clinical Operations Projection

- Una `ClinicalOperationsView` por `EncounterId` y un `asOf`.
- No agrega N Encounter de un paciente. No es una línea longitudinal.

### Patient Care Continuity

- Un `ContinuityPackage` **efímero** por Encounter, derivado de una vista COD.
- Solo el `ClinicalActId` vigente (PCC-9). No se persiste (PCC-10).
- No hay API de “todos los paquetes de este paciente”.
- No es el panel RC-19A `ContinuityPanelShell`.

### Product Platform v2.0

| Epic | Pregunta | Clave | Membresía |
|------|----------|-------|-----------|
| 1 Delivery Queue | ¿Documento listo no entregado? | Encounter + ClinicalAct | clínica, cola operativa |
| 2 Revenue Integrity | ¿Ciclo comercial cerrado? | Encounter + Settlement | comercial, funnel de clínica |

Ninguno agrupa por paciente ni muestra historia de actos.

---

## 3. Análisis de duplicidad

| Capacidad | ¿Ya existe? | ¿Reutilizar? |
|-----------|-------------|--------------|
| Proyectar un Encounter (asOf) | Sí — COD | Sí, por cada `EncounterId` (lectura). |
| Paquete de un Encounter (acto vigente) | Sí — PCC `deriveContinuityPackage` / `loadContinuityPackage` | **Sí. Unidad de lectura. No modificar PCC.** |
| Cola de no entregados del centro | Sí — Epic 1 | **No.** Filtro y métricas distintos. |
| Funnel de ingresos | Sí — Epic 2 | **No.** Dominio comercial. |
| Línea de paquetes de un paciente (N Encounter, orden temporal) | **No** | Hueco de Epic 3. |
| Panel Continuity RC-19A (medicación / timeline de chrome) | Sí — congelado | **No tocar.** |

**No duplica Clinical Delivery Queue.** Epic 1 es cola transversal `document_ready` ∧ `deliveredAt == null`. Epic 3 incluye entregados, no entregados, `absent` y otros estados de handoff, **por paciente**. Un acto entregado debe aparecer aquí y no en Epic 1.

**No duplica Revenue Integrity Dashboard.** Cubos `signed_unpaid` / `lock_anomaly` / etc. no entran en la membresía longitudinal. Settlement en PCC es contexto; no clasifica caja.

**No duplica Patient Care Continuity.** PCC es el **átomo** (un Encounter). Epic 3 es el **agregado** (lista de átomos). No persiste paquetes. No acuña `ClinicalActId`. No mezcla actos (PCC-9 por ítem).

**No duplica Clinical Operations Projection.** COD es una vista. Epic 3 no inventa un `asOf` de paciente; cada ítem conserva el `asOf` de su COD.

**Conclusión:** Epic independiente. Absorberlo en v2.0 mezclaría colas operativas de clínica/caja con historia clínica del paciente.

Reutilizar desde v2.0: **nada como fuente**. Reutilizar desde Core: COD + PCC en solo lectura.

---

## 4. Casos de uso reales

1. El médico abre al paciente antes de la siguiente visita y ve el último acto vigente (receta o resumen, entregado o no).
2. Control crónico: secuencia de actos `document_ready` / `delivered` de varias consultas, sin mezclar `ClinicalActId` de visitas distintas.
3. Traspaso interno: otro médico del centro ve el mismo hilo (paquetes efímeros recalculados), no un historial inventado.
4. Auditoría clínica ligera: cuántos Encounter del paciente tienen handoff `absent` vs entregado.
5. El paciente no usa portal (fuera de alcance); el valor le llega porque el médico no parte de cero ni duplica indicaciones.

---

## 5. Actores

| Actor | Uso | No es |
|-------|-----|--------|
| **Médico** | Usuario principal: hilo de actos vigentes por visita. | No opera Delivery Queue ni caja aquí. |
| **Paciente** | Beneficiario indirecto (continuidad de indicación/documento). Sin UI nueva de portal. | No es un expediente del paciente en el portal. |
| **Clínica** | Menos retrabajo y menos pérdida de hilo entre profesionales. | No es un tablero gerencial de ingresos (Epic 2) ni de entregas pendientes del día (Epic 1). |

---

## 6. Valor esperado

**Clínico**  
El acto vigente de cada visita (`ClinicalActId`, documento, entrega) está en una secuencia. Se evita re-emitir o tratar un acto archivado (PCC-9).

**Operacional**  
Preparación de visita y traspaso entre médicos sin abrir cada ficha ni el panel RC-19A. Independiente del cobro.

**Experiencia del paciente**  
El cuidado retoma el último documento entregado o pendiente, no una historia reconstruida de memoria. El impago no oculta el acto (PCC-5).

---

## 7. Dependencias

**Proyección (solo lectura):**

| Fuente | Uso |
|--------|-----|
| Patient Care Continuity | `loadContinuityPackage` / `deriveContinuityPackage` por `EncounterId` |
| Clinical Operations Projection | Dentro de PCC (`loadClinicalOperationsView`); un `asOf` por ítem |

Sin writes. Sin workflows (`run*` / `ensure*` / `observe*` / `initiate*` / `persist*` / `save*`). Sin persistencia de la línea ni de paquetes.

**Población de ids (lectura Encounter, no clasificación):** `fetchConsultations({ patientId })` para obtener `EncounterId` del paciente. COD/PCC no indexan por paciente. No es un dominio nuevo. No es v2.0. Debe declararse en diseño; no es dependencia oculta.

No consume Epic 1, Epic 2, Settlement workflows, Completion writes, `ContinuityPanelShell`.

---

## 8. Riesgos funcionales y arquitectónicos

| Riesgo | Mitigación (diseño futuro) |
|--------|----------------------------|
| Quinta identidad (`PatientContinuityId`) | Prohibida. Clave = paciente como filtro; ítem = `EncounterId` + `ClinicalActId` vigente. |
| Persistir la línea o los paquetes | Recalcular en cada carga (PCC-10). |
| Mezclar actos de un Encounter | Un paquete por Encounter; PCC-9; dos actos → FAIL. |
| Reusar `ContinuityPanelShell` / dedupe medicación | Superficie de producto **nueva**; cero imports RC-19A Continuity. |
| Montar en ficha Encounter / Delivery Queue / Integridad ingresos | Ruta o módulo nuevo; no editar páginas certificadas. |
| Filtrar por `document_ready` no entregado (copiar Epic 1) | Membresía = todos los Encounter del paciente (o signed/locked); no la cola de entrega. |
| Usar Settlement/caja como filtro | Prohibido (PCC-5). |
| `asOf` único de paciente | Prohibido. Cada ítem lleva el `asOf` de su COD. |
| Editar `/panel/pacientes/[id]` (antecedentes) | Riesgo de mezclar perfil con proyección. Preferir superficie nueva, no reabrir la ficha de perfil como “UI certificada”. |

---

## 9. Métricas PRODUCT-1

Sobre un recálculo read-only de los paquetes del paciente (sin reloj que altere membresía):

| Métrica | Significado |
|---------|-------------|
| `encountersScanned` | Encounter considerados para ese paciente |
| `packagesPresentCount` | Handoff clínico `present` |
| `packagesAbsentCount` | Sin acto vigente (no se acuña `ClinicalActId`) |
| `deliveredCount` | `deliveredAt != null` |
| `documentReadyUndeliveredCount` | `document_ready` ∧ sin entrega (informativo; **no** es la cola Epic 1 del centro) |
| `distinctClinicalActCount` | `ClinicalActId` distintos (debe igualar presentes si PCC-9 se cumple) |

No incluir métricas de ingresos (`signedUnpaidCount`, `lockAnomalyCount`, etc.).

---

## 10. Criterios objetivos de PASS (para un diseño futuro)

| ID | Criterio |
|----|----------|
| LON-1 | Un ítem por `EncounterId`; `ClinicalActId` solo el vigente; mezclar actos → FAIL. |
| LON-2 | No se persiste `ContinuityPackage` ni la línea. |
| LON-3 | Handoff presente aunque `!isPaid` (PCC-5). |
| LON-4 | Membresía ≠ Delivery Queue (incluye entregados y `absent`). |
| LON-5 | Membresía ≠ Revenue Integrity (Completion/PCC definen el ítem clínico, no el cubo comercial). |
| LON-6 | Cada ítem conserva el `asOf` de su COD; no hay `asOf` de paciente. |
| LON-7 | Cero writes / workflows Core. |
| LON-8 | PRODUCT-1 métricas §9; PRODUCT-2 completo. |
| LON-9 | Mismos paquetes de entrada → misma línea (determinista). |
| LON-10 | Cero imports de v2.0 colas, Settlement UI, Completion UI, `ContinuityPanelShell`, PanelLayout. |

---

## 11. Exclusiones explícitas

No se modifican:

- `CORE_PLATFORM`
- `ARCHITECTURE_BASELINE`
- `PRODUCT_PLATFORM` v2.0 (Epic 1 y Epic 2, rutas y módulos)
- RC-19A
- Clinical Completion
- Commercial Settlement
- Clinical Operations Projection
- Patient Care Continuity
- Clinical Delivery Queue
- Revenue Integrity Dashboard

Además:

- Sin nuevos dominios.
- Sin nuevas identidades.
- Sin nuevos workflows.
- Sin cambios en componentes congelados.
- Sin backend.
- Sin persistencia.
- Sin UI reutilizando superficies certificadas (cierre de Encounter, colas v2.0, `ContinuityPanelShell`, overlay, listado, overflow, Facturación, Integridad de ingresos, Entrega clínica).

---

## Resultado

**¿Debe existir como Epic independiente?** **Sí.**

El hueco es la **agregación por paciente** de paquetes ya certificados. COD y PCC operan a un Encounter. v2.0 opera colas de clínica (entrega o caja), no el hilo del paciente.

**¿Reutilizar Product Platform v2.0 como fuente?** **No.**  
**¿Reutilizar Patient Care Continuity?** **Sí, en solo lectura**, un paquete por visita, sin modificar el Core PCC.

El siguiente paso, si se autoriza, es **diseño** (PRODUCT-2). No implementación.
