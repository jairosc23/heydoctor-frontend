# Epic 5 — Operational Pulse Dashboard

**Type:** functional analysis (pre-design)  
**Status:** not authorized for design or implementation  
**Product Platform:** v4.0 remains CERTIFIED and frozen  
**Date:** 2026-08-24

This document does not change Core Platform, Architecture Baseline, or Product Platform v4.0.

**Recommendation:** Epic 5 **must exist as an independent Product Platform epic**. It must not be absorbed into Clinical Delivery Queue, Revenue Integrity Dashboard, Longitudinal Patient Continuity, or Pre-Visit Clinical Brief. It **reuses** las proyecciones certificadas v1.0–v4.0 (y COD/PCC ya resueltos en ellas) y deriva un **pulso operativo de clínica**, no una quinta cola ni una segunda ficha de paciente.

---

## 1. Objetivo funcional del Epic

Proyectar, en solo lectura, el **pulso operativo del centro**: un único briefing de dirección que resume, en el instante de la carga, si la clínica está atascada en entrega, en cierre comercial, en huecos de continuidad o en arranque de visita.

Responde: *¿cómo está operando el centro ahora, según las capacidades ya certificadas?*

No responde:

- qué documentos hay que entregar uno a uno (Epic 1);
- qué Encounter no cerró caja (Epic 2);
- qué actos vigentes tiene un paciente (Epic 3);
- qué retomar en la próxima visita de un paciente (Epic 4);
- el estado de un solo Encounter (COD / PCC).

El pulso es un **objeto de síntesis de clínica**. No es una cola. No es un funnel. No es una línea. No es un brief de paciente.

---

## 2. Problema operativo que resuelve

Dirección médica, administración, recepción y coordinación ven hoy **cuatro tableros distintos** (o ninguno):

- Entrega clínica: backlog de `document_ready` no entregado.
- Integridad de ingresos: cubos comerciales.
- Continuidad longitudinal: hilo de **un** paciente.
- Brief de pre-visita: arranque de **un** paciente.

Nadie tiene una lectura de **un vistazo** para decidir a qué frente atender primero. Recorrer `/panel/entrega-clinica`, `/panel/integridad-ingresos` y N rutas por `patientId` no es un pulso. El listado RC-19A no agrega entrega, caja, `absent` ni brief.

El hueco no es “faltan colas”. El hueco es **falta un pulso**: indicadores derivados de proyecciones ya certificadas, sin reabrir cada trabajo operativo y sin inventar un recorte de calendario.

El pulso **no** es “las citas de hoy”. Eso exigiría reloj y Encounter `draft` / `in_progress`, fuera de v1–v4. El recorte sigue siendo el certificado: Encounter `signed` / `locked` (y los `patientId` que de ellos se derivan).

---

## 3. Actores principales

| Actor | Uso | No es |
|-------|-----|--------|
| **Dirección médica** | Usuario principal: ver si el centro está sano en entrega, caja, continuidad y arranque. No opera cada cola aquí. | No es su lista de entrega ni su brief por paciente. |
| **Administración** | Detectar atasco comercial vs clínico sin mezclar cubos. Priorizar frente. | No repara `lockAnomaly`. No cobra. |
| **Recepción** | Saber si hay backlog de entrega o impagos **en agregado**, para derivar al tablero certificado. | No es la cola de trabajo de entrega ni de cobro. |
| **Coordinación clínica** | Ver huecos de continuidad (último handoff `absent`) y briefs vacíos a nivel de centro. | No recorre la línea de cada paciente ni prepara la visita del médico. |

El médico y el paciente no son actores primarios. El médico sigue en ficha, Epic 1 y Epic 4. El paciente no tiene UI.

---

## 4. Capacidades existentes que reutiliza

### Clinical Operations Projection (CERTIFIED, congelada)

- Una vista por Encounter y un `asOf`.
- Ya alimenta v1.0 y v2.0. No agrega un pulso de clínica.
- **Reutilizar:** vía Product Platform certificado, no reimplementar COD.

### Patient Care Continuity (CERTIFIED, congelada)

- Un `ContinuityPackage` por Encounter. Átomo de v1.0 y v3.0.
- **Reutilizar:** vía v1.0 / v3.0. No llamar `deriveContinuityPackage` desde Epic 5.

### Clinical Delivery Queue — v1.0 (CERTIFIED, congelada)

- Cola del centro: `document_ready` ∧ `deliveredAt == null`.
- **Reutilizar como fuente:** `loadClinicalDeliveryQueue` / métricas. No reimplementar membresía. No listar ítems en el pulso.

### Revenue Integrity Dashboard — v2.0 (CERTIFIED, congelada)

- Cubos comerciales exclusivos.
- **Reutilizar como fuente:** `loadRevenueIntegrityDashboard` / métricas. No reclasificar cubos. No listar filas.

### Longitudinal Patient Continuity — v3.0 (CERTIFIED, congelada)

- Línea por `patientId`.
- **Reutilizar como fuente** para agregar, a nivel de clínica, pacientes con historia (tras enumerar `patientId` desde Encounter `signed` / `locked`). No reimplementar `projectLongitudinalContinuity`. No mostrar la línea.

### Pre-Visit Clinical Brief — v4.0 (CERTIFIED, congelada)

- Brief del último ítem por paciente.
- **Reutilizar como fuente** para contar briefs `ready` vs `empty` y último handoff `absent` a nivel de centro. No reimplementar `projectPreVisitBrief`. No mostrar un brief de paciente.

---

## 5. Confirmación de no duplicidad

| Capacidad | ¿Ya existe? | ¿Reutilizar? |
|-----------|-------------|--------------|
| Cola de no entregados del centro | Sí — Epic 1 | Sí, **métricas**. No la cola. |
| Funnel comercial del centro | Sí — Epic 2 | Sí, **métricas**. No los cubos ni las filas. |
| Línea de un paciente | Sí — Epic 3 | Sí, **por paciente, en lote de clínica**. No la UI ni una segunda línea. |
| Brief de un paciente | Sí — Epic 4 | Sí, **agregado de clínica**. No el briefing individual. |
| Pulso operativo de clínica (síntesis cruzada) | **No** | Hueco de Epic 5. |

**No duplica Clinical Delivery Queue.**  
Epic 1 responde *¿qué acto no se entregó?* Read model = lista. Acción = ir a entregar.  
Epic 5 responde *¿hay backlog de entrega?* Read model = indicador derivado. No filtra `document_ready`. No importa `projectClinicalDeliveryQueue` para reconstruir membresía: llama el loader certificado y lee `pendingDeliveryCount`.

**No duplica Revenue Integrity Dashboard.**  
Epic 2 responde *¿qué Encounter no cerró caja?* Read model = cubos exclusivos.  
Epic 5 no clasifica `signed_unpaid` / `lock_anomaly`. Compone un indicador de **riesgo comercial agregado** desde métricas v2.0. No importa `classifyRevenueIntegrity`.

**No duplica Longitudinal Patient Continuity.**  
Epic 3 responde *¿cuál es la secuencia de este paciente?*  
Epic 5 no lista ítems ni copia `totalContinuityPackages` como métrica propia de un paciente. Agrega a nivel de centro llamando v3.0 / v4.0. No modifica v3.0.

**No duplica Pre-Visit Clinical Brief.**  
Epic 4 responde *¿qué retomo ahora, en este paciente?*  
Epic 5 cuenta cuántos pacientes tienen brief `ready` / `empty` y cuántos orígenes están `absent`. No selecciona `items[n-1]` por su cuenta.

**Conclusión de no duplicidad:** el hueco es la **síntesis de clínica**. Absorberlo en v1.0 o v2.0 mezclaría colas de trabajo con pulso de dirección. Absorberlo en v3.0 o v4.0 es imposible: están congelados y son por paciente.

---

## 6. Casos de uso reales

1. **Ronda de dirección.** Dirección abre el pulso y ve: backlog de entrega > 0, riesgo comercial (impagos + anomalías de lock), pacientes con último handoff `absent`, briefs vacíos. Decide a qué tablero certificado enviar al equipo.
2. **Coordinación de sala.** Coordinación ve que hay muchos briefs `empty` (sin acto certificado previo) vs muchos `lastHandoffAbsent`: no es lo mismo “primera continuidad” que “firma sin documento”.
3. **Recepción no recorre fichas.** Ve el agregado y abre `/panel/entrega-clinica` o `/panel/integridad-ingresos` si el pulso lo indica. No entrega ni cobra desde el pulso.
4. **Administración separa frentes.** Un pulso alto comercial no se lee como fallo de entrega. Un pulso alto de `absent` no se lee como impago.
5. **Traspaso de turno operativo.** El mismo pulso se recálcula (efímero). No hay snapshot persistido del “estado del día”.

Fuera de estos casos: ejecutar entrega, cobro, historia o pre-visita sigue en las superficies certificadas de v1–v4 y en la ficha.

---

## 7. Dependencias

El Epic, si se autoriza, consume **únicamente** en modo **READ ONLY**:

| Fuente | Uso |
|--------|-----|
| Product Platform v1.0 | `loadClinicalDeliveryQueue`. Indicador de backlog de entrega. |
| Product Platform v2.0 | `loadRevenueIntegrityDashboard`. Indicador de riesgo comercial agregado. |
| Product Platform v3.0 | `loadLongitudinalContinuity` por `patientId` (ids desde lectura Encounter `signed` / `locked`). No reimplementar la línea. |
| Product Platform v4.0 | `loadPreVisitBrief` por `patientId`. Indicadores de arranque (`ready` / `empty` / último `absent`). |
| Patient Care Continuity | Ya resuelto dentro de v1.0 y v3.0. No re-derivar paquetes. |
| Clinical Operations Projection | Ya resuelto dentro de v1.0, v2.0 y v3.0. No re-proyectar vistas. No inventar `asOf` de clínica. |

Enumerar `EncounterId` (`signed` / `locked`) y, de ahí, `patientId` únicos, es lectura Encounter para **poblar el lote de clínica**. No es un dominio nuevo. No amplia el recorte a `draft` / `in_progress`. No usa reloj para “hoy”.

Sin writes. Sin workflows (`run*` / `ensure*` / `observe*` / `initiate*` / `persist*` / `save*`). Sin persistencia del pulso. Sin LocalStorage. Sin SessionStorage. Sin Browser State como fuente. Recalcular en cada carga.

**No consume:** Completion writes, Settlement writes, `ContinuityPanelShell`, PanelLayout, ficha Encounter, perfil `/panel/pacientes/[id]`.

Acción permitida (no write): navegar a las superficies **ya certificadas** (`/panel/entrega-clinica`, `/panel/integridad-ingresos`) o, si el diseño lo acota, a un `patientId` concreto en brief/línea. El pulso no entrega, no cobra, no firma.

---

## 8. Riesgos funcionales y arquitectónicos

| Riesgo | Tipo | Mitigación (diseño futuro) |
|--------|------|----------------------------|
| Convertir el pulso en un mashup que re-lista colas y líneas | Funcional | Read model = indicadores + conteos. Prohibido re-renderizar ítems de v1–v4. |
| Copiar nombres PRODUCT-1 de v1–v4 | Funcional | Métricas propias del pulso, derivadas, no `pendingDeliveryCount` / `signedUnpaidCount` / `totalContinuityPackages` / `briefAvailable` como API pública de Epic 5. |
| Reimplementar membresía de Delivery Queue o cubos REV | Arquitectónico | Solo llamar loaders certificados. |
| Reimplementar `projectLongitudinalContinuity` o `projectPreVisitBrief` | Arquitectónico | Llamar v3.0 / v4.0. |
| Inventar un `asOf` de clínica o “pulso de hoy” con `Date` | Arquitectónico | Prohibido. Cada fuente conserva su `asOf`. El pulso no tiene reloj. |
| Quinta identidad (`PulseId`, `DashboardId`) | Arquitectónico | Prohibida. Sin identidad de pulso. |
| Persistir el dashboard | Arquitectónico | Recalcular en cada carga. |
| Montar en listado RC-19A, sidebar, o páginas v1–v4 | Arquitectónico | Superficie **nueva**. Cero edición de chrome y de v1–v4. |
| Enumerar todos los pacientes (N cargas v3/v4) | Operacional | Riesgo de latencia. Diseño debe acotar lote al recorte `signed`/`locked` ya usado; no ampliar. |
| Mezclar pago en indicadores clínicos | Funcional | PCC-5: el pulso de continuidad/brief no filtra por `isPaid`. |
| Tratar React `useState` de carga como fuente | Arquitectónico | Igual que v1–v4: UI no es store de dominio. |

---

## 9. Métricas PRODUCT-1

Derivadas **solo** de loaders certificados (v1.0–v4.0) sobre el recorte `signed` / `locked`. Sin reloj. Sin copiar identificadores de métricas de otros Epics.

| Métrica | Derivación |
|---------|------------|
| `pulseDeliveryBacklog` | `pendingDeliveryCount` de v1.0 |
| `pulseCommercialAtRisk` | `signedUnpaidCount + lockAnomalyCount` de v2.0 |
| `pulseCommercialClosed` | `commerciallyLockedCount` de v2.0 |
| `pulsePatientsScanned` | `patientId` únicos del recorte Encounter |
| `pulseBriefReady` | pacientes con brief v4.0 `briefAvailable === 1` |
| `pulseBriefEmpty` | pacientes con brief v4.0 `briefEmpty === 1` |
| `pulseLastHandoffAbsent` | pacientes con brief v4.0 `origin.handoff === "absent"` |

Invariantes:

- `pulseBriefReady + pulseBriefEmpty === pulsePatientsScanned`.
- `pulseLastHandoffAbsent ≤ pulseBriefReady`.
- `pulseDeliveryBacklog ≥ 0` y no redefine la membresía de Epic 1.
- No incluir `pendingDeliveryCount`, `signedUnpaidCount`, `totalContinuityPackages` ni `briefAvailable` como métricas **propias** de Epic 5.

El pulso no publica `asOf` de clínica.

---

## 10. Criterios objetivos de PASS (para un diseño futuro)

| ID | Criterio |
|----|----------|
| OPD-1 | El pulso no lista ítems de Delivery Queue, filas REV, línea longitudinal ni origin de un brief. |
| OPD-2 | `pulseDeliveryBacklog` es exactamente el `pendingDeliveryCount` certificado de v1.0. |
| OPD-3 | `pulseCommercialAtRisk` no reclasifica cubos; suma métricas v2.0. `lockAnomaly` no cuenta como cierre. |
| OPD-4 | Continuidad / brief de clínica se obtienen llamando v3.0 / v4.0, no reimplementándolos. |
| OPD-5 | `!isPaid` no altera indicadores de entrega, brief ni último handoff. |
| OPD-6 | Sin `asOf` de clínica ni reloj. Cada fuente conserva el suyo. |
| OPD-7 | Cero writes / workflows Core. |
| OPD-8 | Métricas §9 e invariantes. Contrato PRODUCT-2. |
| OPD-9 | Mismos loaders de entrada → mismo pulso (determinista). |
| OPD-10 | Sin persistencia, LocalStorage, SessionStorage, Browser State como fuente, `Date.now` / `new Date` en la proyección. |
| OPD-11 | Sin modificar módulos ni rutas v1.0–v4.0. Sin imports de Settlement UI, Completion UI, `ContinuityPanelShell`, PanelLayout. |
| OPD-12 | Superficie nueva. Ficha Core y v1.0–v4.0 intactas. |
| OPD-13 | Sin identidad nueva. Claves existentes: `EncounterId` / `patientId` / `ClinicalActId` / `SettlementId` solo si alguna fuente certificada ya los trae; el pulso no los acuña. |

---

## 11. Exclusiones explícitas

No se modifican:

- `CORE_PLATFORM`
- `ARCHITECTURE_BASELINE`
- `PRODUCT_PLATFORM` v4.0 (Epic 1, Epic 2, Epic 3, Epic 4, rutas y módulos)
- RC-19A
- Clinical Completion
- Commercial Settlement
- Clinical Operations Projection
- Patient Care Continuity
- Clinical Delivery Queue
- Revenue Integrity Dashboard
- Longitudinal Patient Continuity
- Pre-Visit Clinical Brief

Además:

- Sin nuevos dominios.
- Sin nuevas identidades.
- Sin nuevos workflows.
- Sin backend.
- Sin persistencia.
- Sin Browser State como fuente.
- Sin LocalStorage.
- Sin SessionStorage.
- Sin cambios de estados existentes.
- Sin componentes congelados modificados.
- Sin reloj como fuente funcional (“hoy”, antigüedad, turno).
- Sin recorte `draft` / `in_progress`.
- Sin UI reutilizando superficies certificadas como shell (cierre de Encounter, colas v1.0/v2.0, línea v3.0, brief v4.0, `ContinuityPanelShell`, overlay, listado, overflow, Facturación, perfil de paciente).

---

## Resultado

**¿Debe existir como Epic independiente dentro de Product Platform?** **Sí.**

El hueco es el **pulso operativo de clínica**: un read model de síntesis que cruza entrega, caja, continuidad y arranque **sin** ser ninguna de esas colas o fichas. COD y PCC operan un Encounter. v1.0 y v2.0 son tableros de trabajo del centro. v3.0 y v4.0 son por paciente. Ninguno entrega a dirección/administración/recepción/coordinación una lectura única de salud operativa.

**¿Alguna capacidad existente cubre completamente ese caso de uso?** **No.**  
Abrir cuatro rutas no es un pulso. Concatenar métricas en la cabeza del usuario no es un contrato PRODUCT-2. Absorberlo en v1.0 o v2.0 contaminaría membresías de trabajo. Absorberlo en v3.0 o v4.0 violaría el freeze y el recorte por paciente.

**¿Reutilizar Product Platform v1.0–v4.0 como fuente?** **Sí, en solo lectura**, llamando loaders certificados, sin reimplementar membresía ni cubos.  
**¿Reutilizar COD y PCC?** **Sí, en solo lectura**, únicamente como ya están contenidos en esas proyecciones.

El siguiente paso, si se autoriza, es **diseño** (PRODUCT-2). No implementación.
