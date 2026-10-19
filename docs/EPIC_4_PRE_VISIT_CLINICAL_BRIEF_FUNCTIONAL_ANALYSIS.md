# Epic 4 — Pre-Visit Clinical Brief

**Type:** functional analysis (pre-design)  
**Status:** not authorized for design or implementation  
**Product Platform:** v3.0 remains CERTIFIED and frozen  
**Date:** 2026-08-24

This document does not change Core Platform, Architecture Baseline, or Product Platform v3.0.

**Recommendation:** Epic 4 **must exist as an independent Product Platform epic**. It must not be absorbed into Longitudinal Patient Continuity (v3.0 is frozen) and must not reimplement Patient Care Continuity. It **reuses** the línea certificada de Epic 3 as the unit of reading and derives a **briefing of one visit-start**, not a second timeline.

---

## 1. Objetivo funcional del Epic

Dado un paciente, proyectar el **brief clínico de pre-visita**: el último acto vigente de su línea certificada (o el último handoff `absent`), para que el médico inicie la siguiente consulta con un paquete mínimo de lectura **sin** recorrer la línea completa, **sin** reabrir cada ficha y **sin** reescribir ni persistir actos.

Responde: *¿qué debo retomar ahora, en este paciente, antes de empezar la visita?*

No responde:

- qué actos vigentes tiene a lo largo del tiempo (eso es Epic 3);
- qué falta por entregar en el centro (Epic 1);
- qué falta por cobrar (Epic 2);
- el estado de un solo Encounter (COD / PCC).

El brief es un **objeto de síntesis**. No es la línea. No es el átomo. No es la cola.

---

## 2. Problema clínico que resuelve

Antes de entrar a la consulta, el médico necesita **un punto de arranque certificado**: último `ClinicalActId` vigente, tipo de documento y si se entregó; o bien el hecho explícito de que la última visita firmada no tuvo handoff.

Hoy ese dato existe **disperso**:

- COD y PCC lo describen **por Encounter**.
- Epic 3 lo describe como **secuencia completa**.
- La ficha certificada exige abrir una consulta concreta.
- El panel RC-19A no es un briefing de producto.

El hueco no es “falta historia”. El hueco es **falta un briefing**: la línea obliga a interpretar N ítems para extraer el último acto. En control crónico, traspaso entre médicos o primer minuto de visita, eso retrasa el arranque y aumenta el riesgo de retomar un acto equivocado o de partir de memoria.

El impago no debe ocultar el último acto (PCC-5). El brief no es cobro.

El paciente no opera el brief. Se beneficia porque el médico no duplica indicaciones ni ignora un documento ya emitido.

---

## 3. Actores principales

| Actor | Uso | No es |
|-------|-----|--------|
| **Médico** | Usuario principal: lectura de 60 segundos antes de iniciar. Último handoff vigente o `absent` explícito. Acción = abrir la ficha certificada del Encounter de ese último ítem, si existe. | No opera Delivery Queue, caja ni la línea longitudinal aquí. |
| **Paciente** | Beneficiario indirecto: la visita retoma el último documento o detecta el hueco de handoff. Sin UI nueva de portal. | No es un expediente del paciente ni un resumen para el portal. |
| **Clínica** | Traspaso entre profesionales: el mismo brief se recalcula (efímero) para quien atiende la siguiente visita. Menos pérdida del último acto. | No es tablero gerencial de ingresos (Epic 2), ni cola de entregas del día (Epic 1), ni archivo longitudinal (Epic 3). |

---

## 4. Capacidades existentes que reutiliza

### Clinical Operations Projection (CERTIFIED, congelada)

- Una `ClinicalOperationsView` por `EncounterId` y un `asOf`.
- No agrega N Encounter. No sintetiza un briefing.
- **Reutilizar:** el `asOf` y los slices ya proyectados, **vía** PCC y la línea de Epic 3. No reimplementar COD. No inventar un `asOf` de paciente ni de brief.

### Patient Care Continuity (CERTIFIED, congelada)

- Un `ContinuityPackage` efímero por Encounter. Solo el `ClinicalActId` vigente (PCC-9). No se persiste (PCC-10).
- **Reutilizar:** como átomo ya certificado **dentro de Epic 3**. El brief no llama a reconstruir handoff por su cuenta si la línea ya lo hizo. No modificar PCC. No acñar `ClinicalActId`.

### Longitudinal Patient Continuity (CERTIFIED, congelada, v3.0)

- `LongitudinalContinuityProjection`: N ítems por `patientId`, orden `asOf` ascendente, handoff `absent` explícito.
- Superficie: `/panel/continuidad-longitudinal/[patientId]`.
- Caso de uso 1 de Epic 3 (“ver el último acto vigente”) **usa la línea como herramienta**. No entrega un read model de briefing.
- **Reutilizar como fuente primaria de lectura.** El brief se **deriva** de la proyección ya certificada (último ítem de la línea ordenada). No se modifica v3.0. No se reimplementa `projectLongitudinalContinuity`.

### Clinical Completion (CERTIFIED, congelada)

- Write del acto en la ficha. Un `ClinicalActId` vigente por Encounter.
- **No reutilizar como write.** El brief no emite, no entrega, no supersede. Lee el acto vigente **ya proyectado** en PCC/Epic 3.

### Commercial Settlement (CERTIFIED, congelada)

- Write comercial en la ficha. Independiente del acto.
- **Irrelevante como filtro o membresía** (PCC-5). Settlement puede existir en el paquete como contexto; el brief no clasifica caja.

---

## 5. Confirmación de no duplicidad

| Capacidad | ¿Ya existe? | ¿Reutilizar? |
|-----------|-------------|--------------|
| Vista de un Encounter (`asOf`) | Sí — COD | Sí, solo lectura, vía PCC / Epic 3. |
| Paquete de un Encounter | Sí — PCC | Sí, como átomo ya agregado por Epic 3. No modificar PCC. |
| Cola de no entregados del **centro** | Sí — Epic 1 | **No.** Membresía y métricas distintas. |
| Funnel de ingresos | Sí — Epic 2 | **No.** Dominio comercial. |
| Línea de paquetes de un paciente | Sí — Epic 3 | **Sí, como fuente.** No duplicar la línea. No modificar v3.0. |
| Brief de pre-visita (síntesis del último handoff para arrancar) | **No** | Hueco de Epic 4. |
| Panel Continuity RC-19A | Sí — congelado | **No tocar.** |

**No duplica Clinical Delivery Queue.**  
Epic 1 es cola transversal del centro: `document_ready` ∧ `deliveredAt == null`. El brief no es una cola. Incluye el último acto **aunque esté entregado**. Un `absent` en la última visita **entra** en el brief y **no** entra en Epic 1. Un no entregado de **otra** visita del mismo paciente no convierte al brief en Delivery Queue: el brief habla del **último** ítem de la línea, no de todos los `document_ready` del centro ni del paciente.

**No duplica Revenue Integrity Dashboard.**  
Cubos `signed_unpaid` / `lock_anomaly` / etc. no definen el brief. `isPaid` no oculta ni reordena el último acto.

**No duplica Longitudinal Patient Continuity.**  
Epic 3 responde *¿cuál es la secuencia?* Read model = lista. Métricas = conteos de la línea. Superficie = timeline.  
Epic 4 responde *¿cuál es el punto de arranque de la próxima visita?* Read model = **un** briefing. Métricas = flags del **último** ítem. Superficie nueva.  
Solapamiento de **beneficio** (ambos ayudan a preparar): sí. Solapamiento de **producto**: no, si y solo si Epic 4 no vuelve a listar la línea ni copia métricas LON. Absorber el brief en Epic 3 **está prohibido**: v3.0 está CERTIFIED y congelada.

**No duplica Patient Care Continuity.**  
PCC es el átomo (un Encounter). Epic 4 no deriva un segundo paquete ni monta UI de PCC. Consume el átomo **ya proyectado en la línea**. No persiste. No acuña identidades.

**Conclusión de no duplicidad:** el hueco es la **síntesis de arranque**, no la historia y no el átomo. Reutilizar Epic 3 en solo lectura. No reutilizar Epic 1 ni Epic 2 como fuente.

---

## 6. Casos de uso reales

1. **Minuto cero.** El médico abre el brief del paciente y ve: última receta vigente no entregada, o último resumen ya entregado, o última visita sin handoff. No recorre la línea ni adivina qué ficha abrir.
2. **Control crónico.** Retoma el último `ClinicalActId` (receta vs resumen) sin mezclar el acto de una visita anterior. PCC-9 se conserva: el brief no atribuye el acto de A a B.
3. **Traspaso de turno.** Otro médico de la clínica recalcula el mismo brief (efímero). No hay “nota de pre-visita” persistida.
4. **Primera visita firmada inexistente.** Línea vacía → brief vacío explícito (no hay último acto). No se acuña `ClinicalActId`.
5. **Hueco clínico al arrancar.** Último ítem con `handoff: "absent"`: el médico sabe que la última firma no dejó documento, sin tratarlo como omisión de la visita.
6. **El paciente no usa portal.** El valor le llega porque el médico no duplica indicaciones ni ignora un documento ya emitido. El impago no oculta el último acto.

Fuera de estos casos: consultar la **secuencia** completa sigue siendo Epic 3; entregar el documento sigue siendo la ficha / Epic 1; cobrar sigue siendo la ficha / Epic 2.

---

## 7. Dependencias

El Epic, si se autoriza, consume **únicamente** en modo **READ ONLY**:

| Fuente | Uso |
|--------|-----|
| Longitudinal Patient Continuity | Fuente primaria. `loadLongitudinalContinuity` / `projectLongitudinalContinuity`. El brief se deriva del último ítem de `items` (orden `asOf` ya certificado). |
| Patient Care Continuity | Átomo ya contenido en cada ítem de la línea. No reimplementar `deriveContinuityPackage`. |
| Clinical Operations Projection | `asOf` de cada paquete, vía PCC / Epic 3. El brief **copia** el `asOf` del último ítem. No inventa un `asOf` de brief ni usa el reloj. |

Sin writes. Sin workflows (`run*` / `ensure*` / `observe*` / `initiate*` / `persist*` / `save*`). Sin persistencia del brief. Sin LocalStorage. Sin SessionStorage. Sin Browser State como fuente. Recalcular en cada carga.

Enumerar Encounter por `patientId` **no** es una dependencia nueva de Epic 4: ya está cerrada en Epic 3 (recorte `signed` / `locked`). Epic 4 no amplia el recorte a `draft` / `in_progress`. La próxima visita aún no firmada no genera un `ContinuityPackage`; el brief habla del **último acto certificado**, no del Encounter futuro.

**No consume:** Clinical Delivery Queue, Revenue Integrity, Settlement writes, Completion writes, `ContinuityPanelShell`, PanelLayout, ficha de perfil `/panel/pacientes/[id]`.

Acción permitida (no write): abrir la ficha certificada `/panel/consultas/{encounterId}` del Encounter del último ítem, si existe.

---

## 8. Riesgos funcionales y arquitectónicos

| Riesgo | Tipo | Mitigación (diseño futuro) |
|--------|------|----------------------------|
| Convertir Epic 4 en una segunda línea longitudinal | Funcional | Read model = un briefing, no `items[]`. Prohibido re-listar N paquetes. |
| Copiar métricas de Epic 3 (`totalContinuityPackages`, etc.) | Funcional / PRODUCT-1 | Métricas solo del **último** ítem (flags 0/1). |
| Reimplementar `projectLongitudinalContinuity` o `deriveContinuityPackage` | Arquitectónico | Llamar v3.0 / PCC; no duplicar reconstruct. |
| Absorber el brief en v3.0 | Arquitectónico | Rechazado: v3.0 congelada. Epic independiente. |
| Usar `Date.now` / `new Date` para “antigüedad de la última visita” | Arquitectónico | Prohibido. El brief no mide edad. Conserva `asOf` del último ítem. |
| Filtrar por no entregados del centro (copiar Epic 1) | Funcional | Membresía = último ítem de la línea, entregado o no, `present` o `absent`. |
| Usar Settlement / `isPaid` como filtro | Funcional | Prohibido (PCC-5). |
| Quinta identidad (`BriefId`, `PreVisitId`) | Arquitectónico | Prohibida. Clave = `patientId` (agregación) + `EncounterId` del último ítem + `ClinicalActId` si `present`. |
| Persistir el brief | Arquitectónico | Recalcular en cada carga. |
| Montar en ficha Encounter, perfil de paciente, Delivery Queue, Integridad, o línea Epic 3 | Arquitectónico | Superficie de producto **nueva**. Cero imports de chrome congelado. |
| Incluir Encounter `draft` / `in_progress` como si fueran continuidad | Funcional | Prohibido. El recorte de Epic 3 no se altera. |
| Tratar React `useState` de carga como fuente de verdad | Arquitectónico | Igual que v1–v3: estado de UI no es store de dominio. Fuente = recálculo read-only. |

---

## 9. Métricas PRODUCT-1

Derivadas **solo** del último ítem de la línea certificada (o de la línea vacía). Sin reloj. Sin métricas de Epic 1, 2 o 3.

| Métrica | Derivación |
|---------|------------|
| `hasContinuityHistory` | `1` si la línea tiene ≥ 1 ítem; si no, `0` |
| `lastHandoffPresent` | `1` si existe último ítem y `handoff === "present"` |
| `lastHandoffAbsent` | `1` si existe último ítem y `handoff === "absent"` |
| `lastDocumentDelivered` | `1` si último ítem `present` y `deliveredAt != null` |
| `lastDocumentUndelivered` | `1` si último ítem `present` y `deliveredAt == null` |
| `lastPrescription` | `1` si último ítem `present` y `documentKind === "prescription"` |
| `lastVisitSummary` | `1` si último ítem `present` y `documentKind === "visit_summary"` |

Invariantes:

- Si `hasContinuityHistory === 0`: todas las demás métricas = `0`.
- Si `hasContinuityHistory === 1`: `lastHandoffPresent + lastHandoffAbsent === 1`.
- `lastDocumentDelivered + lastDocumentUndelivered === lastHandoffPresent`.
- `lastPrescription` y `lastVisitSummary` no pueden ser `1` a la vez; ambas pueden ser `0` si el último handoff está `absent` o el documento no es de esos kinds.

No incluir `pendingDeliveryCount`, `signedUnpaidCount`, `totalContinuityPackages`, `activeClinicalActs` ni `absentHandOffCount` (esta última cuenta **toda** la línea; el brief solo pregunta por el **último** `absent`).

---

## 10. Criterios objetivos de PASS (para un diseño futuro)

| ID | Criterio |
|----|----------|
| PVB-1 | El brief representa **solo** el último ítem de la línea Epic 3 (`asOf` máximo; empate = `EncounterId` de esa línea). No lista N visitas. |
| PVB-2 | Un `ClinicalActId` vigente si el último handoff está `present`; si `absent`, `clinicalActId == null` y el brief **existe**. |
| PVB-3 | Línea vacía → brief vacío explícito; no se acuña acto. |
| PVB-4 | `!isPaid` no oculta ni cambia el último acto. |
| PVB-5 | Último acto entregado **entra** en el brief; no es Delivery Queue. |
| PVB-6 | `asOf` del brief = `asOf` del último paquete COD/PCC. Sin `asOf` de paciente. Sin reloj. |
| PVB-7 | Cero writes / workflows Core. Acción = abrir ficha certificada. |
| PVB-8 | Métricas §9; invariantes de §9; contrato PRODUCT-2. |
| PVB-9 | Misma línea de entrada → mismo brief (determinista). |
| PVB-10 | Sin persistencia, LocalStorage, SessionStorage, Browser State como fuente, `Date.now` / `new Date` en la proyección. |
| PVB-11 | Sin imports de Delivery Queue, Revenue Integrity, Settlement UI, Completion UI, `ContinuityPanelShell`, PanelLayout. Sin modificar módulo ni ruta de Epic 3. |
| PVB-12 | Superficie nueva. Ficha Core, v1.0, v2.0 y v3.0 intactas. |
| PVB-13 | Sin identidad nueva. Claves: `patientId` + `EncounterId` del último ítem + `ClinicalActId` si `present`. |

---

## 11. Exclusiones explícitas

No se modifican:

- `CORE_PLATFORM`
- `ARCHITECTURE_BASELINE`
- `PRODUCT_PLATFORM` v3.0 (Epic 1, Epic 2, Epic 3, rutas y módulos)
- RC-19A
- Clinical Completion
- Commercial Settlement
- Clinical Operations Projection
- Patient Care Continuity
- Clinical Delivery Queue
- Revenue Integrity Dashboard
- Longitudinal Patient Continuity

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
- Sin reloj como fuente funcional.
- Sin UI reutilizando superficies certificadas (cierre de Encounter, colas v1.0/v2.0, línea v3.0, `ContinuityPanelShell`, overlay, listado, overflow, Facturación, perfil `/panel/pacientes/[id]`).

---

## Resultado

**¿Debe existir como Epic independiente dentro de Product Platform?** **Sí.**

El hueco es el **brief de arranque**: un read model de un solo objeto derivado de la línea certificada. COD y PCC operan a un Encounter. Epic 3 opera la secuencia. v1.0 y v2.0 operan colas de clínica (entrega o caja). Ninguno entrega el paquete mínimo para empezar la siguiente visita.

**¿Alguna capacidad existente cubre completamente ese caso de uso?** **No.**  
Epic 3 **permite** ver el último acto **recorriendo la línea**; no sustituye un briefing. Absorberlo en v3.0 violaría el freeze. Reimplementarlo desde PCC saltándose Epic 3 duplicaría la agregación longitudinal.

**¿Reutilizar Product Platform v1.0 o v2.0 como fuente?** **No.**  
**¿Reutilizar Longitudinal Patient Continuity?** **Sí, en solo lectura**, como única agregación por paciente.  
**¿Reutilizar Patient Care Continuity y Clinical Operations Projection?** **Sí, en solo lectura**, como átomo y `asOf` ya contenidos en esa línea. Sin modificar Core ni v3.0.

El siguiente paso, si se autoriza, es **diseño** (PRODUCT-2). No implementación.
