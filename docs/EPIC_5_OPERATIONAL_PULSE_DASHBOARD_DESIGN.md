# Epic 5 — Operational Pulse Dashboard

**Type:** production design  
**Status:** design only — not authorized for implementation  
**Product Platform:** independent epic (not v4.0)  
**Date:** 2026-08-25

Core Platform and Product Platform v4.0 remain CERTIFIED and frozen. This Epic consumes certified Product Platform projections v1.0–v4.0. It does not create domains, identities, workflows, or states.

PRODUCT-2 contract: Objective · Dependencies · Read Model · No Writes · PASS · Metrics.

---

## 1. Alcance funcional confirmado

### Objetivo

Proyectar, en solo lectura, una **fotografía operacional del centro**: indicadores derivados de las proyecciones certificadas v1.0–v4.0, para que dirección, administración, recepción y coordinación vean si el centro está presionado en entrega, caja, continuidad o arranque de visita.

El tablero no reemplaza colas de trabajo, dashboards especializados ni fichas clínicas. No modifica Encounter. No ejecuta workflows. No persiste el pulso.

### Problema que resuelve

Los cuatro Epics certificados responden preguntas distintas y viven en rutas distintas. Nadie ve, en un vistazo, la salud operativa del recorte `signed` / `locked`. Recorrer esas rutas no es un pulso. El listado RC-19A no agrega entrega, caja, `absent` ni brief.

El pulso **no** es “las citas de hoy”. Eso exigiría reloj y `draft` / `in_progress`.

### Usuarios principales

Dirección médica. Administración. Recepción. Coordinación clínica. El médico no opera este tablero. El paciente no tiene UI.

### Casos de uso prioritarios

1. Ronda de dirección: ver presiones de entrega, comercial, continuidad y arranque; enviar al equipo al tablero certificado.
2. Coordinación: distinguir brief `empty` (sin historia) vs último handoff `absent` (firma sin documento).
3. Recepción: ver agregado y abrir entrega o integridad de ingresos; no entregar ni cobrar aquí.
4. Administración: no leer un pulso comercial como fallo de entrega.
5. Traspaso de turno: el mismo pulso se recálcula (efímero).

---

## 2. Modelo funcional

### Qué representa

Una **proyección efímera de producto**: composición de cuatro fotografías certificadas tomadas en la misma carga.

- Unidad de lectura clínica (centro): `ClinicalDeliveryQueue` (v1.0) y `RevenueIntegrityDashboard` (v2.0)
- Unidad de lectura por paciente (lote de clínica): `PreVisitClinicalBrief` (v4.0), que ya consume v3.0
- Unidad de agregación: el recorte Encounter `signed` / `locked` (el mismo de v1.0 / v2.0 / v3.0)
- Síntesis: KPIs, un `pulseStatus` de producto, alertas 0/1 y composición (ratios del **mismo** snapshot)

No hay identidad de pulso. No hay `asOf` de clínica. El pulso no crea información: solo deriva números y etiquetas desde v1–v4.

v3.0 se consume **solo a través de v4.0** (`loadPreVisitBrief` → `loadLongitudinalContinuity`). Epic 5 no llama `loadLongitudinalContinuity`, `projectClinicalDeliveryQueue`, `classifyRevenueIntegrity` ni `projectPreVisitBrief`.

### Qué NO representa

- No es Clinical Delivery Queue (no lista no entregados; no es la cola de trabajo).
- No es Revenue Integrity Dashboard (no clasifica cubos; no es el funnel de trabajo).
- No es Longitudinal Patient Continuity (no es la línea de un paciente).
- No es Pre-Visit Clinical Brief (no es el briefing de un paciente).
- No es COD, PCC, Completion ni Settlement (no se consultan de nuevo).
- No es `ContinuityPanelShell` / RC-19A.
- No es un recorte de calendario ni un estado nuevo de Encounter.
- No es fuente de verdad. No se persiste.
- No reemplaza fichas clínicas.

### Relación con v1.0–v4.0

```
recorte signed | locked
    ├── loadClinicalDeliveryQueue                 → pulseDeliveryBacklog
    ├── loadRevenueIntegrityDashboard             → pulseCommercialAtRisk, pulseCommercialClosed
    └── patientIds únicos (lectura Encounter)
            └── loadPreVisitBrief(patientId)      → v4.0 (v3.0 por dentro)
                    → pulseBriefReady, pulseBriefEmpty, pulseLastHandoffAbsent
```

| Epic | Pregunta que sigue siendo suya | Qué toma el pulso | UI |
|------|-------------------------------|-------------------|----|
| v1.0 Delivery Queue | ¿Qué acto no se entregó? | Solo `pendingDeliveryCount` | **No se reutiliza** |
| v2.0 Revenue Integrity | ¿Qué Encounter no cerró caja? | Solo métricas de cubo, sumadas | **No se reutiliza** |
| v3.0 Longitudinal | ¿Cuál es la secuencia de este paciente? | Solo vía v4.0 | **No se reutiliza** |
| v4.0 Pre-Visit Brief | ¿Qué retomo ahora, en este paciente? | Flags agregados de clínica | **No se reutiliza** |

Ningún módulo, ruta ni métrica pública de v1–v4 se modifica. El pulso **navega** a `/panel/entrega-clinica` y `/panel/integridad-ingresos`; no embebe esas páginas ni sus componentes.

---

## 3. Read Model

Nombre: `OperationalPulseDashboard`  
Naturaleza: función pura. Mismas proyecciones v1–v4 de entrada → mismo pulso.

### Entrada

1. `ClinicalDeliveryQueue` (v1.0), ya proyectada.
2. `RevenueIntegrityDashboard` (v2.0), ya proyectada.
3. Lista de `PreVisitClinicalBrief` (v4.0), uno por `patientId` único del recorte.
4. `projectOperationalPulse({ delivery, revenue, briefs })`.

Carga (`loadOperationalPulse`):

1. `loadClinicalDeliveryQueue()` — READ ONLY, módulo v1.0.
2. `loadRevenueIntegrityDashboard()` — READ ONLY, módulo v2.0.
3. Enumerar `patientId` únicos desde `fetchConsultations({ status: "signed" | "locked", limit: 100 })`. Lectura Encounter para **poblar el lote**. No es COD. No es Completion. No es Settlement. No es PCC. Mismo recorte y mismo `limit` que v1.0/v2.0.
4. Por cada `patientId`: `loadPreVisitBrief({ patientId })` — READ ONLY, módulo v4.0.
5. `projectOperationalPulse(...)`.

Prohibido en este Epic:

- `loadClinicalCompletionSnapshot` / `run*` / `save*`
- `ensureSettlement` / `observe*` / `initiate*` / `persist*`
- `loadContinuityPackage` / `deriveContinuityPackage`
- `loadClinicalOperationsView` / `projectClinicalOperationsView`
- `projectClinicalDeliveryQueue` / `classifyRevenueIntegrity` / `projectLongitudinalContinuity` / `projectPreVisitBrief`

Sin LocalStorage, Session, Browser State ni reloj para **clasificar**.  
Sin persistencia. Sin cache como fuente de verdad. Recalcular en cada carga.

### asOf

El pulso **no** tiene `asOf`.  
Cada proyección de entrada conserva el `asOf` de sus ítems. Epic 5 no los min/max, no los fusiona y no inventa un instante de clínica. Cuatro fotografías en una carga no son un único instante lógico. Eso no se “repara”.

### Dashboard

```
OperationalPulseDashboard
  kind: "operational_pulse_dashboard"
  pulseStatus              // etiqueta de producto; ver §5. No es estado Core.
  metrics                  // PRODUCT-1 §6
  alerts                   // 0|1 derivados del mismo snapshot
  composition              // ratios del mismo snapshot (“tendencia” sin tiempo)
```

Sin `items[]` de colas, cubos, líneas ni briefs.

---

## 4. Superficies de producto

Solo Product Platform, **nuevas**:

| Superficie | Rol |
|------------|-----|
| `lib/product-platform/operational-pulse/**` | Read model, métricas, contrato PRODUCT-2, tests |
| `docs/EPIC_OPERATIONAL_PULSE_DASHBOARD.md` | Contrato al implementar |
| `/panel/pulso-operativo` | Página nueva. KPIs + `pulseStatus` + alertas + composición. Enlaces a rutas certificadas de v1.0 y v2.0 |

Sin ítem de sidebar (`PanelLayout` congelado). Importar v1–v4 desde sus módulos (`clinical-delivery-queue`, `revenue-integrity`, `pre-visit-clinical-brief`), **no** ampliar el barrel v1.0.

**No reutilizar ni modificar**

- `PanelLayout`, sidebar, overflow
- RC-19A (listado, overlay, FAB, `page.tsx`)
- Delivery Queue UI (`/panel/entrega-clinica`)
- Revenue Dashboard UI (`/panel/integridad-ingresos`)
- Longitudinal UI (`/panel/continuidad-longitudinal/[patientId]`)
- Brief UI (`/panel/brief-previsita/[patientId]`)
- `ContinuityPanelShell` / `continuity-medication-dedupe`
- Ficha Encounter
- Completion UI / Settlement UI

Acciones (no write): “Abrir entrega clínica”, “Abrir integridad de ingresos”. No hay lista de pacientes en el pulso (sería una cola). Continuidad y brief se leen solo como KPIs.

---

## 5. Modelo del Dashboard

Ninguna información nueva se crea. Todo se deriva de v1–v4.

### KPIs globales (PRODUCT-1)

Los siete conteos de §6. Son los únicos números de impacto del Epic.

### Estado operacional (`pulseStatus`)

Etiqueta **exclusiva de producto** (como un cubo REV, no un estado de Encounter):

| Valor | Regla (determinista, sin reloj) |
|-------|----------------------------------|
| `clear` | las tres presiones = 0 |
| `delivery_pressure` | solo `pulseDeliveryBacklog > 0` |
| `commercial_pressure` | solo `pulseCommercialAtRisk > 0` |
| `continuity_pressure` | solo `pulseLastHandoffAbsent > 0` ∨ `pulseBriefEmpty > 0` |
| `mixed` | dos o más de esas presiones |

Presiones:

- entrega: `pulseDeliveryBacklog > 0`
- comercial: `pulseCommercialAtRisk > 0`
- continuidad/arranque: `pulseLastHandoffAbsent > 0` ∨ `pulseBriefEmpty > 0`

`lockAnomaly` entra en `pulseCommercialAtRisk` y **no** en cierre. `pulseCommercialClosed` no enciende presión.

### Indicadores de la carga corriente (“indicadores diarios”)

No son un recorte de calendario. Son los KPIs de **esta** carga, recalculados cada vez que se abre el tablero. Prohibido filtrar por “hoy”, turno o `Date`.

Se muestran los mismos valores que §6. No hay un segundo recorte.

### Alertas derivadas

Flags 0/1 del mismo snapshot. No hay umbral temporal.

| Alerta | `1` si y solo si |
|--------|------------------|
| `alertDeliveryBacklog` | `pulseDeliveryBacklog > 0` |
| `alertCommercialAtRisk` | `pulseCommercialAtRisk > 0` |
| `alertLastHandoffAbsent` | `pulseLastHandoffAbsent > 0` |
| `alertBriefEmpty` | `pulseBriefEmpty > 0` |

No son tickets. No se persisten. No disparan workflows.

### Composición (“tendencias calculadas”)

No hay serie histórica (exigiría persistencia o reloj). La “tendencia” es la **forma** del snapshot:

```
briefReadyShare        = pulsePatientsScanned === 0 ? 0
                         : floor(pulseBriefReady * 100 / pulsePatientsScanned)
briefEmptyShare        = pulsePatientsScanned === 0 ? 0
                         : floor(pulseBriefEmpty * 100 / pulsePatientsScanned)
commercialAtRiskShare  = (atRisk + closed) === 0 ? 0
                         : floor(pulseCommercialAtRisk * 100
                             / (pulseCommercialAtRisk + pulseCommercialClosed))
```

Enteros. Misma entrada → mismos shares. `briefReadyShare + briefEmptyShare` puede ser `< 100` por truncado; no se “corrige” con reloj.

---

## 6. Métricas PRODUCT-1

Derivadas **solo** de v1.0–v4.0. Sin escribir el Core. Sin reloj. Sin reutilizar nombres públicos de otros Epics.

| Métrica | Derivación |
|---------|------------|
| `pulseDeliveryBacklog` | `delivery.metrics.pendingDeliveryCount` (v1.0) |
| `pulseCommercialAtRisk` | `revenue.metrics.signedUnpaidCount + revenue.metrics.lockAnomalyCount` (v2.0) |
| `pulseCommercialClosed` | `revenue.metrics.commerciallyLockedCount` (v2.0) |
| `pulsePatientsScanned` | `briefs.length` (un brief v4.0 por `patientId` del recorte) |
| `pulseBriefReady` | briefs con `metrics.briefAvailable === 1` |
| `pulseBriefEmpty` | briefs con `metrics.briefEmpty === 1` |
| `pulseLastHandoffAbsent` | briefs con `origin?.handoff === "absent"` |

Invariantes:

- `pulseBriefReady + pulseBriefEmpty === pulsePatientsScanned`
- `pulseLastHandoffAbsent ≤ pulseBriefReady`
- `pulseDeliveryBacklog` = `pendingDeliveryCount` de la cola de entrada (igualdad exacta)
- `lockAnomaly` no incrementa `pulseCommercialClosed`

No incluir `pendingDeliveryCount`, `signedUnpaidCount`, `totalContinuityPackages` ni `briefAvailable` como métricas **propias** de Epic 5.

---

## 7. Riesgos

**Duplicidad con Delivery Queue**  
Riesgo: re-listar ítems o reimplementar `document_ready ∧ deliveredAt == null`. Mitigación: solo `pendingDeliveryCount`; no importar `projectClinicalDeliveryQueue`; no embeber la UI v1.0.

**Duplicidad con Revenue Dashboard**  
Riesgo: reclasificar cubos o copiar filas. Mitigación: sumar métricas v2.0; no importar `classifyRevenueIntegrity`; no embeber la UI v2.0.

**Duplicidad con Longitudinal Continuity**  
Riesgo: mostrar líneas o llamar `projectLongitudinalContinuity`. Mitigación: v3.0 solo dentro de v4.0; el pulso no lista ítems.

**Duplicidad con Pre-Visit Brief**  
Riesgo: mostrar un origin o seleccionar `items[n-1]`. Mitigación: solo agregar flags v4.0; no importar `projectPreVisitBrief`; no embeber la UI v4.0.

**Pérdida de consistencia entre asOf**  
Cada fuente trae `asOf` de COD distintos por Encounter. Mitigación: el pulso no publica `asOf`; no min/max; no inventa un instante de clínica.

**Mezcla de snapshots de distinto instante**  
v1, v2 y cada brief v4.0 se recálculan en la misma carga pero no comparten un `asOf` lógico. Mitigación: se declara composición de cuatro fotografías, no una vista COD. Prohibido usar `Date` para alinearlos. Tests OPD: el pulso no tiene campo `asOf`.

**N cargas v4.0**  
Latencia al enumerar pacientes. Mitigación: mismo `limit: 100` por estado que v1/v2; no ampliar recorte.

---

## 8. Criterios objetivos de PASS

### Funcionales

| ID | Criterio |
|----|----------|
| OPD-1 | El pulso no lista ítems de Delivery Queue, filas REV, línea longitudinal ni origin de un brief. |
| OPD-2 | `pulseDeliveryBacklog === pendingDeliveryCount` de la cola v1.0 de entrada. |
| OPD-3 | `pulseCommercialAtRisk` suma métricas v2.0; no reclasifica cubos; `lockAnomaly` no cuenta como cierre. |
| OPD-4 | Continuidad/brief de clínica vía `loadPreVisitBrief` (v4.0 → v3.0). No reimplementar v3/v4. |
| OPD-5 | `!isPaid` no altera entrega, brief ni último handoff. |
| OPD-6 | Sin `asOf` de clínica ni reloj. `asOf` de fuentes no se fusionan. |
| OPD-8 | Métricas §6 e invariantes. Contrato PRODUCT-2. `pulseStatus`, alertas y composición derivados del mismo snapshot. |
| OPD-9 | Mismas colas/dashboard/briefs de entrada → mismo pulso. |

### Arquitectónicos

| ID | Criterio |
|----|----------|
| OPD-7 | Cero writes: no `run*` / `ensure*` / `observe*` / `initiate*` / `persist*` / `save*`. |
| OPD-10 | Sin persistencia, LocalStorage, Session, Browser State como fuente, `Date.now` / `new Date` en el módulo de proyección. |
| OPD-11 | Sin imports de Settlement UI, Completion UI, `ContinuityPanelShell`, PanelLayout, UIs v1–v4. Sin llamar PCC/COD/Completion/Settlement. Sin modificar módulos v1–v4. |
| OPD-12 | Superficie nueva `/panel/pulso-operativo`; ficha Core y v1.0–v4.0 intactas. |
| OPD-13 | Sin identidad nueva. El pulso no acuña `EncounterId`, `ClinicalActId`, `SettlementId` ni `patientId`. |

Certificación futura: OPD-1…OPD-13 PASS, sin tocar baselines congeladas.

---

## 9. Exclusiones explícitas

No se modifican:

- `CORE_PLATFORM`
- `ARCHITECTURE_BASELINE`
- Product Platform v4.0 (Clinical Delivery Queue, Revenue Integrity Dashboard, Longitudinal Patient Continuity, Pre-Visit Clinical Brief)
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
- Sin writes.
- Sin persistencia.
- Sin backend.
- Sin Browser State como fuente.
- Sin LocalStorage.
- Sin SessionStorage.
- Sin cambios de estados existentes.
- Sin componentes congelados modificados.
- Sin reloj como fuente funcional.
- Sin recorte `draft` / `in_progress`.

---

## Contrato PRODUCT-2 (resumen)

| Sección | Contenido |
|---------|-----------|
| Objective | Fotografía operacional del centro, en solo lectura. |
| Dependencies | READ ONLY: v1.0 cola, v2.0 dashboard, v4.0 briefs (v3.0 vía v4.0); población `patientId` por lectura Encounter `signed`/`locked`. |
| Read Model | `OperationalPulseDashboard`; KPIs + `pulseStatus` + alertas + composición; sin `asOf` de clínica. |
| No Writes | No workflows Core. No modifica Encounter. Acción = abrir tableros certificados v1.0 / v2.0. |
| PASS | OPD-1…OPD-13 |
| Metrics | `pulseDeliveryBacklog`, `pulseCommercialAtRisk`, `pulseCommercialClosed`, `pulsePatientsScanned`, `pulseBriefReady`, `pulseBriefEmpty`, `pulseLastHandoffAbsent` |

---

**Siguiente paso:** aprobación explícita de este diseño. Hasta entonces no hay implementación.
