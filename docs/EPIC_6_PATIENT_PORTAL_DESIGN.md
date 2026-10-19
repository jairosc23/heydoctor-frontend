# Epic 6 — Patient Portal

**Type:** production design  
**Status:** design only — not authorized for implementation  
**Product Platform:** independent epic (not v5.0); candidato v6.0  
**Date:** 2026-08-25  
**Analysis:** `docs/EPIC_6_PATIENT_PORTAL_FUNCTIONAL_ANALYSIS.md` (aprobado)

Core Platform and Product Platform v5.0 remain CERTIFIED and frozen. This Epic consumes the certified `ContinuityPackage`. It does not create domains, identities, workflows, or states. It does not redesign, replace, migrate, or modify the legacy patient portal.

PRODUCT-2 contract: Objective · Dependencies · Read Model · No Writes · PASS · Metrics.

---

## 1. Alcance funcional confirmado

### Objetivo

Proyectar, en solo lectura, la **consulta de un Encounter clínico ya cerrado** desde la perspectiva del paciente: Encounter, acto vigente, estado de entrega y, si `deliveredAt != null`, el documento certificado (receta **o** visit summary). El estado comercial es contexto informativo y **nunca** oculta un documento entregado.

El módulo no modifica Encounter. No ejecuta workflows. No persiste una vista de portal. No toca el portal legado.

### Problema que resuelve

Staff ya ve el átomo en ficha, colas y tableros `/panel`. El paciente, en el portal legado, ve citas y pago (`appointment id`), no el `ContinuityPackage`. El hueco es un **read model de consulta de paciente de un Encounter**, no un segundo historial de citas y no una cola de entrega.

### Usuario principal

Paciente. El médico no opera esta superficie (sigue en `/panel`). Dirección y administración no son actores.

### Casos de uso prioritarios

1. Consultar un Encounter propio por URL `/portal/encounter/[encounterId]` y ver su estado.
2. Ver receta o visit summary **solo** cuando el handoff está entregado (`deliveredAt != null`).
3. Si hay acto vigente pero aún no entregado: ver **Pendiente de entrega**; no ver documento.
4. Si no hay Completion: ver ausencia de documento clínico; no se acuña `ClinicalActId`.
5. Si no hay Settlement: ver comercial ausente/informativo; el documento entregado sigue visible (PCC-5).
6. Si el Encounter no existe o PCC no puede derivar: ver **no disponible**; no se inventa `asOf`.

---

## 2. Objeto: `PortalEncounterView`

Nombre: `PortalEncounterView`  
Naturaleza: proyección efímera de producto. Función pura. Mismo `ContinuityPackage` → misma vista.

No es un dominio. No es fuente de verdad. No se persiste. No tiene identidad propia.

```
PortalEncounterView
  kind: "portal_encounter_view"
  encounterId                 // clave de la URL; no se acuña
  asOf                        // string | null  (copiado del paquete; null si unavailable)
  availability                // "available" | "unavailable"
  encounter                   // ver §5
  delivery                    // ver §5
  document                    // PortalDocument | null  (null si no entregado)
  commercial                  // ver §5; informativo
  metrics                     // PRODUCT-1
```

```
PortalDocument                // solo si delivery.status === "entregado"
  clinicalActId               // copiado; nunca mint
  documentKind                // "prescription" | "visit_summary"
  deliveredAt                 // string  (≠ null por construcción)
  completionState             // string; contexto; no dispara emisión
```

`availability === "unavailable"` ⇒ `asOf == null`, `document == null`, métricas de impacto en 0. El `encounterId` de la URL se conserva como clave pedida, no como Encounter certificado.

Prohibido en el objeto:

- `PatientPortalId`, `PortalDocumentId`, `DeliveryId`, `HistoryId`
- `lockAnomaly` (staff / Epic 2; no superficie de paciente)
- audit chains de Completion o Settlement
- cuerpo de PDF / medicamentos / renderer
- `appointment id`
- `CorrelationId` como campo de negocio (tracing fuera del read model)

---

## 3. Dependencias

Fuente **primaria y exclusiva** de lectura clínica:

| Fuente | Status | Uso |
|--------|--------|-----|
| Patient Care Continuity | CERTIFIED / frozen | `loadContinuityPackage({ encounterId })` / `deriveContinuityPackage`. Un paquete vigente por Encounter. |

Completion y Settlement **solo** como slices ya resueltos dentro de ese paquete (`clinicalHandoff`, `operationalContext`). Clinical Operations Projection queda **transitiva** (PCC ya llama COD). Este Epic **no** llama `loadClinicalOperationsView` ni `projectClinicalOperationsView`.

### Carga (`loadPortalEncounterView`)

1. Recibir `encounterId` (param de ruta).
2. Si el id está vacío: devolver vista `unavailable`. No llamar PCC. No usar reloj.
3. `loadContinuityPackage({ encounterId })` — READ ONLY, módulo PCC certificado.
4. `projectPortalEncounterView(package)`.
5. Si PCC/COD lanzan (sin `asOf`, actos mezclados, id incoherente): capturar en el **loader** y devolver `unavailable`. No mint. No reparar. No `Date.now`.

### Prohibido consultar

- `run*` / `ensure*` / `observe*` / `initiate*` / `persist*` / `save*`
- `loadClinicalCompletionSnapshot` / `runClinicalCompletion`
- `ensureSettlement` / `observeCommercialSettlement` / `initiateCommercialPayment` / `persistSettlementAtomic`
- `loadClinicalOperationsView` / `projectClinicalOperationsView`
- `projectClinicalDeliveryQueue` / `classifyRevenueIntegrity` / `projectLongitudinalContinuity` / `projectPreVisitBrief` / `projectOperationalPulse`
- `fetchPortalAppointments` / `fetchPortalAppointment` / cancelación / reagendamiento / pagos del portal legado

Sin LocalStorage, SessionStorage, Browser State ni reloj para **clasificar**.  
Sin persistencia. Sin cache como fuente de verdad. Recalcular en cada carga.

`useState` de carga/error en la página (como v2–v5) no es fuente de dominio.

---

## 4. Composición

```
EncounterId                         (clave; URL)
    └── loadContinuityPackage       [fuente primaria; PCC CERTIFIED]
            └── ContinuityPackage
                    ├── clinicalHandoff     → delivery + document
                    └── operationalContext  → encounter status + commercial
                            └── ClinicalOperationsView   [ya resuelto; no reentrar]
                                    ├── Encounter slice
                                    ├── Completion slice
                                    └── Settlement slice
```

El Product Epic **no** vuelve a proyectar COD. No llama v1.0–v5.0.

| Capacidad certificada | Relación |
|-----------------------|----------|
| PCC | Única unidad de lectura. |
| COD | Transitiva. No importar. |
| Clinical Completion | Slice `clinicalHandoff`. Cero writes. Cero UI de cierre. |
| Commercial Settlement | Slice `operationalContext` (`settlementId`, `isPaid`). Cero writes. Cero cubos. |
| Product Platform v1.0–v5.0 | No es fuente. No se modifica. |
| Portal legado | Convive. Cero edits. |

`appointment id` ≠ `EncounterId`. No hay mapeo-identidad.

---

## 5. Estados visibles

No son estados de dominio nuevos. Son etiquetas de producto derivadas del paquete.

### Encounter

| Condición PCC | `encounter.present` | Copy |
|---------------|---------------------|------|
| `operationalContext.present` y `encounterStatus` no vacío | `true` | Estado de ciclo de vida copiado (`draft` … `locked`); copy en español en UI |
| resto, con vista `available` | `false` | Sin estado de Encounter inventado |
| vista `unavailable` | `false` | «Consulta no disponible» |

### Entrega y documento

Regla normativa:

```
document visible  ⇔  clinicalHandoff.present ∧ deliveredAt != null
si deliveredAt == null (handoff present) → copy "Pendiente de entrega"; document = null
si handoff absent                         → copy "Sin documento clínico"; document = null
```

| `delivery.status` | Condición | UI |
|-------------------|-----------|-----|
| `entregado` | handoff `present` ∧ `deliveredAt != null` | Bloque documento: Receta **o** Resumen de visita + fecha de entrega (`deliveredAt` del paquete, no reloj) |
| `pendiente_de_entrega` | handoff `present` ∧ `deliveredAt == null` | Solo «Pendiente de entrega». **Nunca** mostrar documento (ni kind, ni acto como documento, ni PDF) |
| `ausente` | handoff `present: false` | «Sin documento clínico». No mint de `ClinicalActId` |
| n/a | `unavailable` | No hay bloque de entrega |

`documentKind` en métricas puede conocer prescription vs visit_summary aunque la UI no muestre documento (pendiente). La **superficie** no revela kind hasta `entregado`.

### Comercial (informativo)

| Condición | Copy | Efecto sobre documento |
|-----------|------|------------------------|
| `settlementId != null` ∧ `isPaid` | Pagado | Ninguno |
| `settlementId != null` ∧ `!isPaid` | Pendiente de pago | Ninguno — no oculta entrega |
| `settlementId == null` | Sin información comercial | Ninguno |
| `unavailable` | No se muestra cubo | — |

Cero CTA de pagar, facturar, bloquear o reenviar. Cero `lockAnomaly` en UI.

### Independencia de v1.0–v5.0 y del portal legado

| | Delivery Queue | Portal legado | Patient Portal (Epic 6) |
|--|----------------|---------------|-------------------------|
| Actor | Staff | Paciente (citas/pago) | Paciente (clínico) |
| Pregunta | ¿Qué no se entregó? | ¿Cuándo es mi cita / debo pagar? | ¿Qué quedó de **este** Encounter? |
| Clave | EncounterId (cola) | appointment id | EncounterId (uno) |
| Documento | membresía = no entregado | no usa PCC | visible **solo** si entregado |
| Writes | no (abre ficha) | sí (cancelar, pagar) | **no** |

---

## 6. Reglas READ ONLY

El Epic no escribe. No ejecuta workflows. No observa para persistir.

| Puede | No puede |
|-------|----------|
| Llamar `loadContinuityPackage` | `run*` / `ensure*` / `observe*` / `persist*` / `save*` |
| Copiar `ClinicalActId` / `SettlementId` del paquete | Acuñar identidades |
| Mostrar metadatos certificados | Emitir, firmar, entregar, reenviar, pagar, bloquear |
| Recalcular la vista en cada carga | Persistir `PortalEncounterView` |
| `useState` de loading/error | LocalStorage / SessionStorage / clock como fuente |

Acción de UI: ninguna de write. No hay «abrir ficha», «ir a pagar», «reenviar». El paciente puede seguir usando el nav legado **sin que este Epic lo altere**.

Barrel v1.0 (`lib/product-platform/index.ts`) **no** se modifica y **no** exporta este Epic.

---

## 7. Superficie

Solo Product Platform, **nueva**:

| Superficie | Rol |
|------------|-----|
| `lib/product-platform/patient-portal/**` | Read model, métricas, contrato PRODUCT-2, tests |
| `docs/EPIC_PATIENT_PORTAL.md` | Contrato al implementar |
| `/portal/encounter/[encounterId]` | Página **nueva**. Consulta READ ONLY. Copy en español. `data-testid`. |

Archivo de ruta previsto (cuando se autorice implementación), **sin editar archivos existentes**:

```
app/portal/(app)/encounter/[encounterId]/page.tsx
```

Eso produce la URL `/portal/encounter/[encounterId]` y **hereda** el `layout.tsx` / `PortalShell` actuales por route group, **sin modificarlos**. No se añade ítem al `NAV` de `PortalShell` (eso sería editar chrome legado). No hay sidebar de panel.

**No reutilizar ni modificar**

- `PanelLayout`, sidebar, overflow, RC-19A
- Ficha Encounter, `EncounterClosureSection`, Completion UI, Settlement UI
- `ContinuityPanelShell`
- `/panel/entrega-clinica`, `/panel/integridad-ingresos`, continuidad, brief, pulso
- Páginas legado: `app/portal/(app)/page.tsx`, `citas/**`, `historial`, `pagos`, `perfil`, `reclamar`, `(auth)/register`
- `app/portal/(app)/layout.tsx`, `components/portal/PortalShell.tsx`
- `lib/services/patient-portal`
- Auth, Branding (`BrandLogo` ya está en el shell legado; la página nueva no reimplementa login ni marca)

Descubrimiento de la URL (enlace desde historial) **queda fuera**: exigiría editar el historial legado.

---

## 8. Métricas PRODUCT-1

Derivadas **únicamente** de `PortalEncounterView` (a su vez del `ContinuityPackage`). Sin reloj. Sin métricas de v1–v5.

| Métrica | Derivación |
|---------|------------|
| `portalEncounterAvailable` | `1` si `availability === "available"`; si no, `0` |
| `portalHandoffPresent` | `1` si handoff `present` |
| `portalDocumentDelivered` | `1` si handoff `present` ∧ `deliveredAt != null` |
| `portalDocumentKind` | `0` ninguno; `1` visit_summary; `2` prescription (del handoff; `0` si absent o kind null) |
| `portalCommerciallyPaid` | `1` si `operationalContext.present` ∧ `isPaid`; si no, `0` |

Invariantes:

- Si `portalEncounterAvailable === 0`: las demás = `0`.
- `portalDocumentDelivered` implica `portalHandoffPresent`.
- `portalCommerciallyPaid` **no** cambia `portalDocumentDelivered` ni `portalHandoffPresent`.
- `portalDocumentKind ∈ {0,1,2}`; 1 y 2 son mutuamente excluyentes.

No incluir `pendingDeliveryCount`, cubos REV, `pulseStatus` ni conteos de línea.

---

## 9. Riesgos

**Coexistencia con el portal legado**  
Riesgo: rediseñar `/portal`, editar `PortalShell`, historial, pagos o Auth. Mitigación: un solo archivo de página nuevo bajo `(app)/encounter/[encounterId]`; cero diffs en páginas/layout/servicios legado; cero ítems nuevos en `NAV`; citas/pagos siguen igual. Heredar el shell no es modificarlo.

**Exposición de documentos no entregados**  
Riesgo: mostrar kind, acto o PDF cuando `deliveredAt == null`. Mitigación: `document == null` salvo entregado; copy único «Pendiente de entrega»; tests PP-6.

**Dependencia exclusiva de ContinuityPackage**  
Riesgo: reentrar COD, Completion store o Settlement store; o llamar v1–v5. Mitigación: único loader clínico = `loadContinuityPackage`; lista de imports prohibidos en tests (como OPD/PVB).

**Ausencia de Completion**  
Riesgo: acuñar `ClinicalActId` o fingir receta. Mitigación: handoff `absent` → `delivery.status = ausente`; `document = null`; no mint.

**Ausencia de Settlement**  
Riesgo: ocultar el documento o inventar `SettlementId`. Mitigación: comercial «sin información»; `isPaid` no filtra (PCC-5); `settlementId` solo si el paquete lo trae.

**Acceso por Encounter inexistente**  
Riesgo: inventar `asOf` con reloj o mostrar un Encounter vacío como si existiera. Mitigación: COD/PCC sin `asOf` → loader devuelve `unavailable`; no mint; copy «Consulta no disponible».

**Ausencia de writes**  
Riesgo: botones de pagar/cancelar/emitir/reenviar, o reutilizar la página de citas. Mitigación: la página de Epic 6 no importa `cancelPortalAppointment`, pagos ni Completion UI; cero `run*` / `ensure*`.

**Ausencia de nuevas identidades**  
Riesgo: `PatientPortalId` / `PortalDocumentId` / `DeliveryId` / `HistoryId`, o usar `appointment id` como clave. Mitigación: clave = `EncounterId`; copiar solo identidades oficiales del paquete; `CorrelationId` no es campo del view.

**Gate paciente ↔ Encounter (residual)**  
PCC lee Encounter vía el puerto certificado de COD (`fetchConsultation`). Este Epic no crea un puerto de autorización ni modifica Auth. Si la sesión de paciente no puede leer ese Encounter, la vista es `unavailable`. No se resuelve mintando identidad ni abriendo backend. Queda declarado; no es FAIL del read model si la proyección es fiel al paquete obtenido.

**Cuerpo del documento (residual)**  
COD/PCC certifican metadatos, no PDF. Este diseño no incluye visor de bytes. Incidente aparte sobre Completion, no este Epic.

---

## 10. Criterios objetivos de PASS (PP-1 … PP-12)

| ID | Criterio |
|----|----------|
| PP-1 | READ ONLY. Cero writes de Core o de Product Platform v1.0–v5.0. |
| PP-2 | Cero workflows: no `run*` / `ensure*` / `observe*` / `initiate*` / `persist*` / `save*`. |
| PP-3 | Consume únicamente `ContinuityPackage` (COD transitivo). Completion y Settlement solo como slices ya proyectados. |
| PP-4 | No consume ni reimplementa v1.0–v5.0. |
| PP-5 | Clave = `EncounterId`. Un `ClinicalActId` vigente copiado o `null`. Sin identidades nuevas. Sin dominios nuevos. Sin estados de dominio nuevos. |
| PP-6 | Documento en UI solo si `deliveredAt != null`. Si `deliveredAt == null` y hay handoff: «Pendiente de entrega» y `document == null`. Pago no oculta un documento entregado (PCC-5). |
| PP-7 | Comercial informativo. Cero CTA de pago / lock / factura. Sin `lockAnomaly` en superficie. |
| PP-8 | Superficie solo `/portal/encounter/[encounterId]`. Cero chrome `/panel`. Cero componentes administrativos. |
| PP-9 | Cero modificaciones sobre Core Platform, Product Platform v1.0–v5.0, RC-19A, Auth, portal legado (`app/portal` existente), Branding, Workspace, Foundation, WebRTC. |
| PP-10 | Proyección determinista. Sin persistencia. Sin LocalStorage. Sin SessionStorage. Sin Browser State como fuente. Sin `Date.now` / `new Date` en el módulo de proyección. |
| PP-11 | PRODUCT-1: métricas §8 e invariantes. PRODUCT-2: Objective, Dependencies, Read Model, No Writes, PASS, Metrics. |
| PP-12 | Cero regresiones sobre Core Platform y Product Platform v1.0–v5.0. Encounter inexistente o PCC no derivable → `unavailable`, no mint. |

### FAIL

- Cualquier write, mint de identidad, o nuevo estado/dominio persistido.
- Editar un file freeze (incluido portal legado y `PortalShell`).
- Reutilizar UI de `/panel` o de cierre clínico/comercial.
- Llamar loaders v1–v5 o stores de Completion/Settlement.
- Usar `fetchPortalAppointments` como fuente clínica.
- Tratar `appointment id` como `EncounterId`.
- Mostrar documento (kind / acto / PDF) cuando `deliveredAt == null`.
- Ocultar documento entregado porque `isPaid === false`.
- Reloj o storage de browser como fuente.

Certificación futura (si se autoriza) es **evidencia**, no corrección. Un FAIL = incidente independiente.

---

## 11. Restricciones y exclusiones

No se modifican:

- `CORE_PLATFORM`
- `ARCHITECTURE_BASELINE`
- RC-19A
- Clinical Completion
- Commercial Settlement
- Clinical Operations Projection
- Patient Care Continuity
- Product Platform v1.0–v5.0
- Auth, Workspace, Foundation, Branding, WebRTC
- Portal legado (`app/portal` actual: citas, pagos, historial, perfil, register, layout, `PortalShell`)

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
- Sin rediseño / reemplazo / migración del portal legado.

---

## Contrato PRODUCT-2 (resumen)

| Sección | Contenido |
|---------|-----------|
| Objective | Consulta READ ONLY de un Encounter clínico certificado, en perspectiva de paciente. |
| Dependencies | READ ONLY: `ContinuityPackage` (Completion y Settlement ya resueltos como slices). |
| Read Model | `PortalEncounterView`; documento solo si `deliveredAt != null`; comercial informativo; `unavailable` si PCC no deriva. |
| No Writes | No workflows Core. No modifica Encounter. No paga. No entrega. No toca portal legado. |
| PASS | PP-1 … PP-12 |
| Metrics | `portalEncounterAvailable`, `portalHandoffPresent`, `portalDocumentDelivered`, `portalDocumentKind`, `portalCommerciallyPaid` |

---

**Siguiente paso:** aprobación explícita de este diseño. Hasta entonces no hay implementación.
