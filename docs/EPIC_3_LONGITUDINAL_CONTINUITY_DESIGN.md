# Epic 3 — Longitudinal Patient Continuity

**Type:** production design  
**Status:** design only — not authorized for implementation  
**Product Platform:** independent epic (not v2.0)  
**Date:** 2026-08-24

Core Platform and Product Platform v2.0 remain CERTIFIED and frozen. This Epic consumes certified `ContinuityPackage` and `ClinicalOperationsView`. It does not create domains, identities, workflows, or states.

PRODUCT-2 contract: Objective · Dependencies · Read Model · No Writes · PASS · Metrics.

---

## 1. Alcance funcional confirmado

### Objetivo

Reconstruir, en solo lectura, la **secuencia cronológica de actos clínicos vigentes** de un paciente: un `ContinuityPackage` por `EncounterId`, con el `ClinicalActId` vigente y el `asOf` de COD.

El módulo no cierra actos, no entrega documentos, no cobra y no persiste historia.

### Problema que resuelve

PCC y COD describen **una** visita. Epic 1 es la cola de no entregados del **centro**. Epic 2 es el funnel **comercial**. El médico no tiene un hilo del **paciente** hecho de paquetes certificados, sin abrir cada ficha y sin el panel RC-19A.

### Usuarios principales

Médico. Clínica (traspaso entre profesionales). El paciente es beneficiario indirecto (sin portal).

### Casos de uso prioritarios

1. Preparar la siguiente visita: ver el último acto vigente (documento y entrega).
2. Control crónico: secuencia de visitas con receta o resumen, entregado o no.
3. Traspaso: otro médico recálcula la misma línea (efímera).
4. Detectar visitas firmadas/locked **sin** handoff clínico (`absent`).

---

## 2. Modelo funcional

### Qué representa

Una **proyección efímera de producto**: lista ordenada de `ContinuityPackage` ya derivados, agrupados por `patientId`.

- Unidad de lectura: `ContinuityPackage`
- Unidad de agregación: `patientId`
- Clave de cada elemento: `EncounterId`
- Identidad clínica de cada elemento: `ClinicalActId` vigente, si el handoff está `present`

No hay identidad de línea. No hay `asOf` de paciente.

### Qué NO representa

- No es Patient Care Continuity (eso es el átomo; este Epic es la lista).
- No es Clinical Operations Projection (eso es una vista por Encounter).
- No es Clinical Delivery Queue (no es la cola de no entregados del centro).
- No es Revenue Integrity Dashboard (no clasifica caja).
- No es `ContinuityPanelShell` / timeline RC-19A.
- No es fuente de verdad. No se persiste.
- No es un nuevo estado de Encounter, Completion o Settlement.

### Relación con el Core

```
patientId
    └── EncounterIds (lectura de lista por patientId)
            └── loadContinuityPackage(encounterId)
                    └── ClinicalOperationsView (asOf)
                            └── ContinuityPackage
                                    └── LongitudinalContinuityItem
```

Settlement en el paquete es contexto (PCC-5): **no** filtra la línea.

### Independencia de v2.0

| | Delivery Queue (v1.0) | Revenue Integrity (v2.0) | Longitudinal (Epic 3) |
|--|------------------------|---------------------------|------------------------|
| Pregunta | ¿No entregado en el centro? | ¿Cierre comercial? | ¿Qué actos vigentes tiene este paciente? |
| Agregación | clínica | clínica | **paciente** |
| Incluye entregados | no | n/a | **sí** |
| Incluye `absent` | no | n/a | **sí** |
| Filtro de pago | no | sí (cubos) | **no** |

Módulos, rutas y métricas no se comparten. El código v2.0 no se modifica.

---

## 3. Read Model

Nombre: `LongitudinalContinuityProjection`  
Naturaleza: función pura. Mismos paquetes + mismo `patientId` → misma línea.

### Entrada

1. `patientId` (filtro de agregación; no es identidad oficial nueva).
2. Enumerar `EncounterId` de ese paciente (`fetchConsultations({ patientId })`, lectura Encounter). Recorte: `signed` y `locked` (actos de continuidad; no `draft` / `in_progress`).
3. Por cada id: `loadContinuityPackage` (PCC → COD). READ ONLY.
4. `projectLongitudinalContinuity({ patientId, packages })`.

Sin `run*` / `ensure*` / `observe*` / `initiate*` / `persist*` / `save*`.  
Sin LocalStorage, Session, Browser ni reloj para **ordenar o clasificar**.  
Sin persistencia. Sin cache como fuente de verdad. Recalcular en cada carga.

### Ítem

```
LongitudinalContinuityItem
  patientId
  encounterId
  asOf                          // copiado del ContinuityPackage (COD)
  clinicalActId                 // string | null  (null si handoff absent)
  handoff                       // "present" | "absent"
  completionState               // string | null
  documentKind                  // "prescription" | "visit_summary" | null
  deliveredAt                   // string | null
```

`clinicalActId` solo si `handoff === "present"`. No se acuña.

### Línea

```
LongitudinalContinuityProjection
  kind: "longitudinal_continuity_projection"
  patientId
  items: LongitudinalContinuityItem[]   // orden §5
  metrics: { … PRODUCT-1 … }
```

**Duplicados:** dos paquetes con el mismo `EncounterId` y distinto `ClinicalActId` → error de producto (PCC-9). Mismo Encounter y mismo acto → se conserva uno.

**Handoff absent:** el ítem **existe** (la visita cuenta); `handoff: "absent"`; `clinicalActId: null`.

---

## 4. Superficies de producto

Solo Product Platform, **nuevas**:

| Superficie | Rol |
|------------|-----|
| `lib/product-platform/longitudinal-continuity/**` | Read model, métricas, contrato PRODUCT-2, tests |
| `docs/EPIC_LONGITUDINAL_PATIENT_CONTINUITY.md` | Contrato al implementar |
| `/panel/continuidad-longitudinal/[patientId]` | Página nueva. Lista cronológica + métricas. Enlace a `/panel/consultas/{encounterId}` |

Sin ítem de sidebar (`PanelLayout` congelado).

**No reutilizar ni modificar**

- RC-19A (listado, overflow, overlay, FAB, `page.tsx`)
- Clinical Completion UI / mount de cierre
- Commercial Settlement UI
- Clinical Delivery Queue (módulo, `/panel/entrega-clinica`)
- Revenue Integrity Dashboard (módulo, `/panel/integridad-ingresos`)
- `ContinuityPanelShell` / `continuity-medication-dedupe`
- `PanelLayout`, sidebar, overflow
- Ficha Encounter
- Ficha de perfil `/panel/pacientes/[id]` (datos/antecedentes; no se convierte en esta UI)

Acción: “Abrir consulta” hacia la ficha certificada. Entrega y firma siguen allí.

---

## 5. Modelo longitudinal

| Regla | Definición |
|-------|------------|
| Un Encounter = un ContinuityPackage | Un ítem por `EncounterId`. |
| Un ClinicalActId vigente por Encounter | Si `present`, el `clinicalActId` del paquete; si no, `absent`. |
| Orden cronológico por Encounter | Ordenar `items` por `asOf` **ascendente** (más antiguo → más reciente). Empate: `EncounterId` ascendente. Solo strings COD; no `Date.now()`. |
| `asOf` de COD | Cada ítem copia `package.asOf`. Prohibido un `asOf` de paciente o el máximo de la línea como fuente. |
| Handoff absent | Ítem visible con `handoff: "absent"`. No se omite la visita. |

`payment` / `lockAnomaly` no cambian el orden ni la membresía.

No se mezclan `ClinicalActId` entre Encounter: el acto de A no se atribuye a B.

---

## 6. Métricas PRODUCT-1

Derivadas **solo** de `items` (a su vez solo de PCC). Sin escribir el Core. Sin reloj.

| Métrica | Derivación |
|---------|------------|
| `totalContinuityPackages` | `items.length` |
| `activeClinicalActs` | ítems con `handoff === "present"` |
| `absentHandOffCount` | ítems con `handoff === "absent"` |
| `deliveredDocumentCount` | `present` y `deliveredAt != null` |
| `visitSummaryCount` | `present` y `documentKind === "visit_summary"` |
| `prescriptionCount` | `present` y `documentKind === "prescription"` |

Invariantes:

- `totalContinuityPackages === activeClinicalActs + absentHandOffCount`
- `activeClinicalActs` = número de `ClinicalActId` no nulos (si PCC-9 se cumple, son distintos)
- No incluir métricas de Epic 1 (`pendingDeliveryCount`) ni de Epic 2 (`signedUnpaidCount`, `lockAnomalyCount`, …)
- `document_ready` sin entrega **sí** puede contar en `activeClinicalActs` y no en `deliveredDocumentCount`; no es la cola del centro

---

## 7. Riesgos

**Duplicidad con Patient Care Continuity**  
PCC permanece el único derivado 1:1 Encounter→paquete. Este Epic no reimplementa `deriveContinuityPackage`. Solo agrega. Riesgo: copiar lógica de handoff. Mitigación: llamar PCC; no duplicar reconstruct.

**Duplicidad con Delivery Queue**  
No filtrar `document_ready` ∧ `deliveredAt == null` como membresía. No importar `projectClinicalDeliveryQueue`. Métrica `deliveredDocumentCount` es conteo del paciente, no la cola del centro.

**Duplicidad con Revenue Integrity**  
No clasificar cubos comerciales. No importar `classifyRevenueIntegrity`. `isPaid` no ordena ni excluye.

**Mezcla de ClinicalActId**  
Dos paquetes / un Encounter con actos distintos → throw. Un ítem no lleva más de un `clinicalActId`. Tests LON de coherencia.

**Pérdida del asOf**  
Prohibido sustituir `asOf` por `updatedAt` de UI o `new Date()`. Campo obligatorio en el ítem; vacío → no proyectar esa fila (o fail de consistencia).

**Orden cronológico inconsistente**  
Única clave de orden: `asOf` (ISO de COD) + `EncounterId`. No `signedAt` mixto. Recalcular no debe barajar si los `asOf` no cambian (determinismo).

---

## 8. Criterios objetivos de PASS

### Funcionales

| ID | Criterio |
|----|----------|
| LON-1 | Un ítem por `EncounterId`; `ClinicalActId` vigente o `absent`; mezclar actos → FAIL. |
| LON-2 | Handoff `absent` produce ítem, no omisión. |
| LON-3 | `!isPaid` no elimina ni reordena ítems. |
| LON-4 | Membresía incluye entregados; no es Delivery Queue. |
| LON-5 | Orden `asOf` ascendente + empate `EncounterId`; determinista. |
| LON-6 | Cada ítem conserva el `asOf` del paquete COD/PCC. |
| LON-8 | Métricas §6; `totalContinuityPackages === activeClinicalActs + absentHandOffCount`. Contrato PRODUCT-2. |
| LON-9 | Mismos paquetes → misma proyección. |

### Arquitectónicos

| ID | Criterio |
|----|----------|
| LON-7 | Cero writes: no `run*` / `ensure*` / `observe*` / `initiate*` / `persist*` / `save*`. |
| LON-10 | Sin persistencia, LocalStorage, Session, `Date.now` / `new Date` en el módulo de proyección. |
| LON-11 | Sin imports de Delivery Queue, Revenue Integrity, Settlement UI, Completion UI, `ContinuityPanelShell`, PanelLayout. |
| LON-12 | Superficie nueva `/panel/continuidad-longitudinal/[patientId]`; ficha Core y v2.0 intactas. |
| LON-13 | Sin identidad nueva; claves `patientId` (agregación) + `EncounterId` (ítem) + `ClinicalActId` (si present). |

Certificación futura: LON-1…LON-13 PASS, sin tocar baselines congeladas.

---

## 9. Exclusiones explícitas

No se modifican:

- `CORE_PLATFORM`
- `ARCHITECTURE_BASELINE`
- Product Platform v2.0 (Clinical Delivery Queue, Revenue Integrity Dashboard)
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
- Sin writes.
- Sin persistencia.
- Sin backend.
- Sin cambios de estados existentes.

---

## Contrato PRODUCT-2 (resumen)

| Sección | Contenido |
|---------|-----------|
| Objective | Secuencia cronológica de actos vigentes de un paciente, en solo lectura. |
| Dependencies | READ ONLY: lista Encounter por `patientId` + `loadContinuityPackage` (COD vía PCC). |
| Read Model | `LongitudinalContinuityProjection`; un paquete por Encounter; `asOf` de COD; `absent` explícito. |
| No Writes | No workflows Core. Acción = abrir ficha certificada. |
| PASS | LON-1…LON-13 |
| Metrics | `totalContinuityPackages`, `activeClinicalActs`, `absentHandOffCount`, `deliveredDocumentCount`, `visitSummaryCount`, `prescriptionCount` |

---

**Siguiente paso:** aprobación explícita de este diseño. Hasta entonces no hay implementación.
