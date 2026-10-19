# Epic 4 — Pre-Visit Clinical Brief

**Type:** production design  
**Status:** design only — not authorized for implementation  
**Product Platform:** independent epic (not v3.0)  
**Date:** 2026-08-24

Core Platform and Product Platform v3.0 remain CERTIFIED and frozen. This Epic consumes certified `LongitudinalContinuityProjection`. It does not create domains, identities, workflows, or states.

PRODUCT-2 contract: Objective · Dependencies · Read Model · No Writes · PASS · Metrics.

---

## 1. Alcance funcional confirmado

### Objetivo

Proyectar, en solo lectura, el **punto de partida clínico** de la próxima consulta: el último ítem de la línea certificada de Longitudinal Patient Continuity (último `asOf`; empate ya resuelto por Epic 3), con el `ClinicalActId` vigente o el handoff `absent` explícito, y el `asOf` copiado de esa línea.

El módulo no modifica Encounter, no crea continuidad, no cierra actos, no entrega documentos, no cobra y no persiste un brief.

### Problema que resuelve

La línea de Epic 3 responde *qué actos vigentes tiene este paciente*. El médico, en el minuto cero, necesita *qué retomar ahora*. Recorrer N ítems, abrir fichas o usar el panel RC-19A no es un briefing. El hueco es un **objeto de síntesis**, no una segunda historia.

### Usuarios principales

Médico. Clínica (traspaso entre profesionales). El paciente es beneficiario indirecto (sin portal).

### Casos de uso prioritarios

1. Minuto cero: ver el último handoff (receta o resumen, entregado o no, o `absent`) sin recorrer la línea.
2. Control crónico: retomar el `ClinicalActId` del **último** Encounter de la línea, no un acto de una visita anterior.
3. Traspaso: otro médico recálcula el mismo brief (efímero).
4. Primera continuidad: línea vacía → brief vacío explícito; no se acuña acto.
5. Hueco al arrancar: último ítem `absent` permanece `absent`; no se busca hacia atrás el último acto `present`.

---

## 2. Modelo funcional

### Qué representa

Una **proyección efímera de producto**: un briefing derivado de `LongitudinalContinuityProjection`.

- Unidad de lectura: `LongitudinalContinuityProjection` (fuente primaria)
- Unidad de síntesis: el **último** `LongitudinalContinuityItem` de `items` (orden ya certificado)
- Unidad de agregación: `patientId` (filtro; no es identidad oficial nueva)
- Encounter origen: `encounterId` de ese último ítem, o ninguno si la línea está vacía
- Identidad clínica: `ClinicalActId` del último ítem si `handoff === "present"`; si no, `null`

No hay identidad de brief. No hay `asOf` de paciente. No hay `asOf` de “próxima visita”. El brief no crea información: solo resume el último acto vigente **ya proyectado**.

Regla de selección (normativa):

```
lastItem = items[items.length - 1]   // línea vacía → brief empty
```

No se reordena. No se usa reloj. No se elige “el último `handoff === present`”. Si el último ítem es `absent`, el brief es `absent`.

### Qué NO representa

- No es Longitudinal Patient Continuity (eso es la línea; este Epic es el briefing).
- No es Patient Care Continuity (eso es el átomo 1 Encounter → 1 paquete).
- No es Clinical Operations Projection (eso es una vista por Encounter).
- No es Clinical Delivery Queue (no es la cola de no entregados del centro).
- No es Revenue Integrity Dashboard (no clasifica caja).
- No es `ContinuityPanelShell` / timeline RC-19A.
- No es el Encounter futuro (`draft` / `in_progress`). No amplia el recorte de Epic 3.
- No es fuente de verdad. No se persiste.
- No es un nuevo estado de Encounter, Completion o Settlement.
- No crea continuidad. No modifica Encounter. No ejecuta workflows.

### Relación con capacidades certificadas

```
patientId
    └── loadLongitudinalContinuity / projectLongitudinalContinuity     [fuente primaria]
            └── LongitudinalContinuityProjection.items  (asOf asc, empate EncounterId)
                    └── last item
                            └── PreVisitClinicalBrief.origin + metrics
```

PCC y COD **no se vuelven a implementar**. Quedan como fuentes **derivadas ya resueltas** dentro de cada ítem de la línea:

| Fuente | Rol en Epic 4 |
|--------|----------------|
| Longitudinal Patient Continuity | Única agregación por paciente. Orden y membresía (`signed` / `locked`) ya certificados. |
| Patient Care Continuity | Átomo de cada ítem (`ClinicalActId` vigente o `absent`). El brief no llama `deriveContinuityPackage`. |
| Clinical Operations Projection | `asOf` de cada ítem. El brief **copia** `lastItem.asOf`. No deriva un `asOf` propio. |

Settlement en PCC es contexto de la línea (PCC-5) y **no** entra al read model del brief: no filtra, no se clasifica, no se muestra como cubo comercial.

### Independencia de v1.0, v2.0 y v3.0

| | Delivery Queue (v1.0) | Revenue Integrity (v2.0) | Longitudinal (v3.0) | Pre-Visit Brief (Epic 4) |
|--|------------------------|---------------------------|----------------------|---------------------------|
| Pregunta | ¿No entregado en el centro? | ¿Cierre comercial? | ¿Qué actos vigentes tiene este paciente? | ¿Qué retomo ahora, antes de la visita? |
| Read model | cola de N ítems | cubos de N Encounter | lista de N ítems | **un** briefing |
| Incluye entregados | no | n/a | sí | **sí, si el último ítem lo está** |
| Incluye `absent` | no | n/a | sí (toda la línea) | **sí, si el último ítem es `absent`** |
| Filtro de pago | no | sí (cubos) | no | **no** |
| Métricas | conteos de cola | conteos de cubos | conteos de la línea | **flags 0/1 del último ítem** |

Módulos, rutas y métricas no se comparten. El código v1.0, v2.0 y v3.0 no se modifica.

---

## 3. Read Model

Nombre: `PreVisitClinicalBrief`  
Naturaleza: función pura. Misma `LongitudinalContinuityProjection` → mismo brief.

### Entrada

1. `patientId` (filtro de agregación; no es identidad oficial nueva).
2. `loadLongitudinalContinuity({ patientId })` **o** `projectPreVisitBrief(projection)` sobre una proyección ya obtenida. READ ONLY.
3. Seleccionar el último ítem según §2. No reordenar.

Sin `run*` / `ensure*` / `observe*` / `initiate*` / `persist*` / `save*`.  
Sin LocalStorage, Session, Browser State ni reloj para **seleccionar o clasificar**.  
Sin persistencia. Sin cache como fuente de verdad. Recalcular en cada carga.

No enumerar Encounter en este Epic: esa lectura ya está cerrada en v3.0 (`signed` / `locked`). No se añade `draft` / `in_progress`.

### Origen (cuando hay historia)

```
PreVisitBriefOrigin
  encounterId                   // Encounter origen = último ítem
  asOf                          // copiado de lastItem.asOf (COD vía Epic 3)
  clinicalActId                 // string | null  (null si handoff absent)
  handoff                       // "present" | "absent"
  completionState               // string | null   (contexto operacional clínico)
  documentKind                  // "prescription" | "visit_summary" | null
  deliveredAt                   // string | null   (estado de entrega)
```

`clinicalActId` solo si `handoff === "present"`. No se acuña.  
`documentKind` y `deliveredAt` solo tienen sentido si `present`; si `absent`, ambos `null` (ya proyectado así en Epic 3).

No hay `isPaid`, `settlementId`, `lockAnomaly` ni cubos comerciales en el origen.

### Brief

```
PreVisitClinicalBrief
  kind: "pre_visit_clinical_brief"
  patientId
  status: "empty" | "ready"     // empty ⇔ origin == null ⇔ línea vacía
  origin: PreVisitBriefOrigin | null
  metrics: { … PRODUCT-1 … }
```

**Línea vacía:** `status: "empty"`, `origin: null`. El brief **existe**. No hay `asOf`. No hay Encounter origen. No hay `ClinicalActId`.

**Línea no vacía:** `status: "ready"`, `origin` = copia de campos del último ítem. `asOf` obligatorio; si el ítem no trae `asOf` (Epic 3 ya falla), este Epic no proyecta un `asOf` sustituto.

**Prohibido:**

- Inventar un segundo ítem o una lista.
- Tomar el último `handoff === "present"` si el último ítem es `absent`.
- Tomar un `ClinicalActId` de un Encounter distinto al origen.
- Sustituir `asOf` por reloj, `updatedAt` de UI o el máximo calculado de nuevo sobre la línea.

---

## 4. Superficies de producto

Solo Product Platform, **nuevas**:

| Superficie | Rol |
|------------|-----|
| `lib/product-platform/pre-visit-clinical-brief/**` | Read model, métricas, contrato PRODUCT-2, tests |
| `docs/EPIC_PRE_VISIT_CLINICAL_BRIEF.md` | Contrato al implementar |
| `/panel/brief-previsita/[patientId]` | Página nueva. Un briefing + métricas. Enlace a `/panel/consultas/{encounterId}` si `status === "ready"` |

Sin ítem de sidebar (`PanelLayout` congelado). Importar Epic 3 desde `lib/product-platform/longitudinal-continuity`, **no** desde el barrel v1.0.

**No reutilizar ni modificar**

- `PanelLayout`, sidebar, overflow
- RC-19A (listado, overlay, FAB, `page.tsx`)
- Clinical Completion UI / mount de cierre
- Commercial Settlement UI
- Clinical Delivery Queue (módulo, `/panel/entrega-clinica`)
- Revenue Integrity Dashboard (módulo, `/panel/integridad-ingresos`)
- Longitudinal Continuity UI (módulo, `/panel/continuidad-longitudinal/[patientId]`)
- `ContinuityPanelShell` / `continuity-medication-dedupe`
- Ficha Encounter
- Ficha de perfil `/panel/pacientes/[id]`

Acción: “Abrir consulta” hacia la ficha certificada del Encounter **origen**. Entrega, firma y cobro siguen allí. No hay acción de write. No hay acción obligatoria hacia la UI de Epic 3.

---

## 5. Modelo del Brief

El brief no crea información. Resume el último acto vigente disponible para iniciar la siguiente atención.

| Campo de diseño | Definición | Fuente |
|-----------------|------------|--------|
| **Encounter origen** | `origin.encounterId` del último ítem. `null` si `empty`. | Epic 3 `items[n-1].encounterId` |
| **ClinicalActId vigente** | `origin.clinicalActId` si `handoff === "present"`; si no, `null`. Un solo acto. El de A no se atribuye a B. | Epic 3 `items[n-1].clinicalActId` |
| **Documento vigente** | `origin.documentKind` (`prescription` \| `visit_summary` \| `null`) y `origin.completionState`. `null` si `absent`. | Epic 3 `items[n-1]` |
| **Estado de entrega** | `origin.deliveredAt` (`string` \| `null`). Entregado **sí** forma parte del brief. No es membresía de cola. | Epic 3 `items[n-1].deliveredAt` |
| **Contexto operacional** | Contexto **clínico de arranque**: `handoff` + `completionState` + entrega. No es contexto comercial. No se proyectan `isPaid`, `lockAnomaly` ni `settlementId`. | Epic 3 `items[n-1]` |
| **asOf** | `origin.asOf`, copiado del último ítem (COD vía PCC vía Epic 3). Prohibido un `asOf` de brief, de paciente o de reloj. Ausente solo si `empty`. | Epic 3 `items[n-1].asOf` |

`payment` / `lockAnomaly` no cambian `status`, `origin` ni métricas.

---

## 6. Métricas PRODUCT-1

Derivadas **únicamente** del último ítem de Longitudinal Patient Continuity (o de la línea vacía). Sin escribir el Core. Sin reloj. Sin métricas de Epic 1, 2 o 3.

| Métrica | Derivación |
|---------|------------|
| `hasContinuityHistory` | `1` si `status === "ready"`; si no, `0` |
| `lastHandoffPresent` | `1` si origen `handoff === "present"` |
| `lastHandoffAbsent` | `1` si origen `handoff === "absent"` |
| `lastDocumentDelivered` | `1` si origen `present` y `deliveredAt != null` |
| `lastDocumentUndelivered` | `1` si origen `present` y `deliveredAt == null` |
| `lastPrescription` | `1` si origen `present` y `documentKind === "prescription"` |
| `lastVisitSummary` | `1` si origen `present` y `documentKind === "visit_summary"` |

Invariantes:

- Si `hasContinuityHistory === 0`: todas las demás = `0`.
- Si `hasContinuityHistory === 1`: `lastHandoffPresent + lastHandoffAbsent === 1`.
- `lastDocumentDelivered + lastDocumentUndelivered === lastHandoffPresent`.
- `lastPrescription` y `lastVisitSummary` no pueden ser `1` a la vez.

No incluir `pendingDeliveryCount`, `signedUnpaidCount`, `totalContinuityPackages`, `activeClinicalActs` ni `absentHandOffCount`.

---

## 7. Riesgos

**Duplicidad con Longitudinal Continuity**  
Riesgo: re-listar `items` o copiar métricas LON. Mitigación: read model = un briefing; selección = último ítem; métricas solo flags 0/1; no modificar ni importar la UI de Epic 3; llamar `loadLongitudinalContinuity` / `projectLongitudinalContinuity`, no reimplementarlos.

**Duplicidad con Patient Care Continuity**  
Riesgo: volver a derivar `ContinuityPackage` o acuñar acto. Mitigación: no llamar `deriveContinuityPackage`; no mint de `ClinicalActId`; el átomo ya viene en el ítem de la línea.

**Duplicidad con Delivery Queue**  
Riesgo: filtrar `document_ready` ∧ `deliveredAt == null` o importar `projectClinicalDeliveryQueue`. Mitigación: membresía = último ítem, entregado o no, `present` o `absent`. `lastDocumentUndelivered` es un flag del origen, no la cola del centro.

**Duplicidad con Revenue Integrity Dashboard**  
Riesgo: clasificar cubos o usar `isPaid` como filtro. Mitigación: no importar `classifyRevenueIntegrity`; no proyectar Settlement; PCC-5 se conserva.

**Pérdida del asOf**  
Riesgo: `Date.now()`, `new Date()`, `asOf` de paciente o recalcular el máximo. Mitigación: copiar `lastItem.asOf`; brief `empty` sin `asOf`; tests PVB de copia.

**Mezcla de ClinicalActId**  
Riesgo: si el último ítem es `absent`, “recuperar” el acto `present` anterior; o copiar el acto de otro Encounter. Mitigación: origen = último ítem **tal cual**; un `clinicalActId` o `null`; Epic 3 ya rechaza dos actos en un Encounter; tests PVB de no look-back.

**Generación de un Brief distinto con la misma entrada**  
Riesgo: reordenar, usar reloj, o estado de navegador. Mitigación: función pura `projectPreVisitBrief(projection)`; misma proyección → mismo brief; sin LocalStorage / Session / Browser como fuente; sin `Date` en el módulo de proyección.

---

## 8. Criterios objetivos de PASS

### Funcionales

| ID | Criterio |
|----|----------|
| PVB-1 | El brief representa **solo** el último ítem de la línea (`items[n-1]`). No lista N visitas. No hace look-back al último `present`. |
| PVB-2 | `ClinicalActId` vigente si el origen está `present`; si `absent`, `clinicalActId == null` y el brief `ready` existe. |
| PVB-3 | Línea vacía → `status: "empty"`, `origin: null`; no se acuña acto. |
| PVB-4 | `!isPaid` no oculta ni cambia el origen (la línea de entrada ya no filtra por pago). |
| PVB-5 | Último acto entregado **entra** en el brief; no es Delivery Queue. |
| PVB-6 | `origin.asOf` = `asOf` del último ítem. Sin `asOf` de paciente ni de reloj. `empty` no inventa `asOf`. |
| PVB-8 | Métricas §6 e invariantes. Contrato PRODUCT-2. |
| PVB-9 | Misma `LongitudinalContinuityProjection` → mismo brief. |

### Arquitectónicos

| ID | Criterio |
|----|----------|
| PVB-7 | Cero writes: no `run*` / `ensure*` / `observe*` / `initiate*` / `persist*` / `save*`. |
| PVB-10 | Sin persistencia, LocalStorage, Session, Browser State como fuente, `Date.now` / `new Date` en el módulo de proyección. |
| PVB-11 | Sin imports de Delivery Queue, Revenue Integrity, Settlement UI, Completion UI, `ContinuityPanelShell`, PanelLayout, UI de Epic 3. Sin modificar `lib/product-platform/longitudinal-continuity/**`. |
| PVB-12 | Superficie nueva `/panel/brief-previsita/[patientId]`; ficha Core, v1.0, v2.0 y v3.0 intactas. |
| PVB-13 | Sin identidad nueva; claves `patientId` (agregación) + `EncounterId` origen (si `ready`) + `ClinicalActId` (si `present`). |

Certificación futura: PVB-1…PVB-13 PASS, sin tocar baselines congeladas.

---

## 9. Exclusiones explícitas

No se modifican:

- `CORE_PLATFORM`
- `ARCHITECTURE_BASELINE`
- Product Platform v3.0 (Clinical Delivery Queue, Revenue Integrity Dashboard, Longitudinal Patient Continuity)
- RC-19A
- Clinical Completion
- Commercial Settlement
- Clinical Operations Projection
- Patient Care Continuity
- Longitudinal Patient Continuity
- Clinical Delivery Queue
- Revenue Integrity Dashboard

Además:

- Sin nuevos dominios.
- Sin nuevas identidades.
- Sin nuevos workflows.
- Sin writes.
- Sin persistencia.
- Sin backend.
- Sin Browser State como fuente.
- Sin LocalStorage.
- Sin SessionStorage.
- Sin cambios de estados existentes.
- Sin componentes congelados modificados.
- Sin reloj como fuente funcional.

---

## Contrato PRODUCT-2 (resumen)

| Sección | Contenido |
|---------|-----------|
| Objective | Punto de partida clínico de la próxima consulta, en solo lectura. |
| Dependencies | READ ONLY: `LongitudinalContinuityProjection` (PCC y COD ya resueltos en cada ítem). |
| Read Model | `PreVisitClinicalBrief`; último ítem de la línea; `asOf` copiado; `empty` explícito. |
| No Writes | No workflows Core. No modifica Encounter. Acción = abrir ficha certificada del origen. |
| PASS | PVB-1…PVB-13 |
| Metrics | `hasContinuityHistory`, `lastHandoffPresent`, `lastHandoffAbsent`, `lastDocumentDelivered`, `lastDocumentUndelivered`, `lastPrescription`, `lastVisitSummary` |

---

**Siguiente paso:** aprobación explícita de este diseño. Hasta entonces no hay implementación.
