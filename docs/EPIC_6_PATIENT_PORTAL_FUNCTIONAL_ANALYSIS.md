# Epic 6 — Patient Portal

**Type:** functional analysis (pre-design)  
**Status:** not authorized for design or implementation  
**Product Platform:** v5.0 remains CERTIFIED and frozen  
**Date:** 2026-08-25

This document does not change Core Platform, Architecture Baseline, RC-19A, Clinical Completion, Commercial Settlement, Clinical Operations Projection, Patient Care Continuity, Auth, Workspace, Foundation, Branding, WebRTC, or Product Platform v1.0–v5.0.

**Recommendation:** Epic 6 **must exist as an independent Product Platform epic**. It must not be absorbed into Clinical Delivery Queue, Revenue Integrity, Longitudinal Continuity, Pre-Visit Brief, Operational Pulse, the certified Encounter closure, or the **legacy patient portal** (Auth / citas / pagos / historial). It **reuses** COD and PCC in read-only mode and derives a **consulta de paciente de un Encounter ya certificado**, not a cola de clínica, not a línea, not un brief de médico, not a portal de agendamiento.

Esperar **aprobación explícita** antes de pasar al diseño. Este documento no autoriza código.

---

## 1. Objetivo

Diseñar el primer **Patient Portal funcional de Product Platform**: una superficie **READ ONLY** en la que el paciente consulta, para **un** `EncounterId`, la información clínica **ya certificada**.

Responde: *¿qué quedó de mi consulta — Encounter, acto vigente, documento entregado (receta o visit summary), estado de entrega y, solo como contexto, estado comercial?*

No responde:

- qué documentos hay que entregar en el centro (Epic 1);
- qué Encounter no cerró caja (Epic 2);
- cuál es la secuencia longitudinal del paciente para el médico (Epic 3);
- qué debe retomar el médico antes de la próxima visita (Epic 4);
- cómo está operando la clínica (Epic 5);
- cómo agendar, cancelar, reagendar o pagar una cita (portal legado);
- cómo emitir, firmar, bloquear o reenviar un acto (ficha / Core).

El portal de producto es un **read model de consulta de paciente**. No es un dominio. No es un workflow. No es una identidad. No es el portal legado de citas.

---

## 2. Justificación funcional

El Core ya certifica, por Encounter:

- el ciclo de vida del Encounter;
- el acto clínico vigente (`ClinicalActId`) y si hay receta o visit summary;
- si ese documento se entregó (`deliveredAt`);
- el asentamiento comercial (`SettlementId`, pago, anomalía de lock) como contexto, **sin** condicionar el handoff clínico (PCC-5).

Esa información llega hoy **solo a superficies de staff**:

| Superficie | Actor | Qué ve |
|------------|-------|--------|
| Ficha `/panel/consultas/[id]` | Médico | Cierre clínico y comercial (writes certificados) |
| `/panel/entrega-clinica` | Médico / operación | Cola de **no** entregados |
| `/panel/integridad-ingresos` | Administración | Cubos comerciales del centro |
| `/panel/continuidad-longitudinal/[patientId]` | Médico | Línea de paquetes |
| `/panel/brief-previsita/[patientId]` | Médico | Arranque de visita |
| `/panel/pulso-operativo` | Dirección | Síntesis de clínica |
| `/portal/citas`, `/portal/historial`, `/portal/pagos` | Paciente | Citas, cancelación, reagendamiento, pago — **no** el `ContinuityPackage` |

El paciente no tiene una lectura certificada de **su Encounter clínico**. El historial legado lista citas (`appointment id`, `paymentStatus`) y no el acto vigente, el kind del documento ni `deliveredAt`. La cola de entrega es el inverso operativo: staff ve lo **no** entregado; el paciente necesita ver lo **entregado**.

Sin este Epic, el paciente o bien no ve el documento clínico, o bien se le abre una ficha / cola de staff, o bien se reabre el portal legado (Auth, pagos, writes). Ninguna de esas vías es un Product Platform v6.0.

El impago no debe ocultar el documento entregado (PCC-5). El estado comercial es informativo. El paciente no paga, no repara `lockAnomaly` y no reenvía.

---

## 3. Alcance

### Incluido (READ ONLY)

Mostrar, para un `EncounterId`:

- Encounter (identidad canónica y estado de ciclo de vida);
- documento clínico **entregado** (hecho certificado: kind + `deliveredAt`);
- receta **o** visit summary (kind del acto vigente; no ambos como actos distintos — PCC-9: un `ClinicalActId` vigente);
- estado de entrega (`deliveredAt` presente vs ausente);
- estado del Encounter (slice COD / contexto operativo PCC);
- estado comercial **solo informativo** (`SettlementId` presente o ausente, `isPaid`; no cobro, no cubos, no reparación).

Población: **un** Encounter por URL. No es un listado de clínica. No es una línea longitudinal.

Membresía funcional del **documento visible**:

- hay handoff clínico `present`;
- `deliveredAt != null`.

Si el Encounter existe pero el documento **no** está entregado: se muestra Encounter + estados; **no** se presenta un documento entregado. Eso no es Epic 1 (Epic 1 es cola de staff de no entregados).

Si el handoff es `absent`: se muestra el hecho explícito de ausencia; no se inventa `ClinicalActId`.

### Excluido de este alcance (sigue en §8)

Editar, firmar, emitir, pagar, bloquear, reenviar, modificar actos, ejecutar workflows, crear dominios, crear identidades, persistir paquetes, usar Browser / LocalStorage / SessionStorage como fuente, reutilizar chrome de `/panel`.

### Grano del “documento”

COD y PCC certifican **metadatos** del acto (`documentKind`, `state`, `deliveredAt`, `clinicalActId`). No certifican el cuerpo del PDF ni el renderer de receta.

Este Epic consulta esa **información clínica ya certificada**. No reabre el pipeline de emisión (`ensurePrescriptionPdf`, `runClinicalCompletion`). No monta `ClinicalCompletionSection`. Mostrar el PDF/cuerpo es un hueco residual: no es FAIL de este análisis; no se resuelve inventando `PortalDocumentId` ni llamando writes. Si se autoriza más adelante un visor de bytes, será incidente aparte sobre Completion, no este Epic.

---

## 4. Dependencias

El Epic, si se autoriza, consume **únicamente** en modo **READ ONLY**, **siempre mediante las proyecciones certificadas**.

| Fuente | Status | Uso |
|--------|--------|-----|
| Patient Care Continuity | CERTIFIED / frozen | Unidad de lectura del paciente: un `ContinuityPackage` por `EncounterId`. Handoff clínico (acto vigente, kind, `deliveredAt`) + contexto operativo (estado Encounter, `SettlementId`, `isPaid`, `lockAnomaly` copiado). |
| Clinical Operations Projection | CERTIFIED / frozen | Ya resuelta **dentro** de PCC (`loadContinuityPackage` → `loadClinicalOperationsView`). Encounter + Completion + Settlement en un `asOf`. No reimplementar COD. |
| Clinical Completion | CERTIFIED / frozen | Solo el **slice** que COD/PCC ya proyectan. Nunca `runClinicalCompletion`, `saveClinicalCompletionSnapshot`, ni UI de cierre. |
| Commercial Settlement | CERTIFIED / frozen | Solo el **slice** que COD/PCC ya proyectan. Nunca `ensureSettlement`, `observeCommercialSettlement`, `initiateCommercialPayment`, `persistSettlementAtomic`. |

Nunca llamar: `run*` / `ensure*` / `observe*` / `persist*` / `save*`.

### No es dependencia (congelado; no reentrar)

| Fuente | Por qué no |
|--------|------------|
| Product Platform v1.0 | Cola de **no** entregados de staff. Membresía inversa. Superficie `/panel`. |
| Product Platform v2.0 | Cubos comerciales de clínica. El paciente no opera integridad de ingresos. |
| Product Platform v3.0 | Línea por `patientId` para el médico. El portal es un Encounter, no la secuencia. |
| Product Platform v4.0 | Brief de pre-visita del médico. |
| Product Platform v5.0 | Pulso de clínica. |
| RC-19A / PanelLayout / ContinuityPanelShell | Chrome de staff. |
| Portal legado (`app/portal/(app)/citas`, `pagos`, `historial`, `perfil`, Auth) | Plataforma congelada en Core (“patient portal remain out of this domain”). Incluye **writes** (cancelar, reagendar, pagar). |
| `lib/services/patient-portal` | Citas / appointment id, no `ContinuityPackage`. |

Completion y Settlement **no** se leen por sus stores ni por sus secciones de ficha. Se leen porque COD ya los proyecta y PCC ya los empaqueta.

Identidades permitidas (solo las oficiales):

- `EncounterId` (clave de la superficie);
- `ClinicalActId` (acto vigente copiado; nunca mint);
- `SettlementId` (contexto copiado; nunca mint);
- `CorrelationId` (tracing; nunca clave de negocio).

Prohibido crear: `PatientPortalId`, `PortalDocumentId`, `DeliveryId`, `HistoryId`.

---

## 5. Modelo funcional

### Objeto

Un **Patient Encounter View** efímero, keyed por `EncounterId`, derivado de **un** `ContinuityPackage` (y, transitivamente, de **una** `ClinicalOperationsView` con un `asOf`).

No se persiste. No es fuente de verdad. Mismos inputs → misma vista (determinista). Sin reloj (`Date.now` / `new Date`) en la proyección.

### Composición (conceptual)

```
EncounterId
    └── ContinuityPackage          (PCC; efímero)
            └── ClinicalOperationsView   (COD; un asOf)
                    ├── Encounter slice
                    ├── Completion slice   (ClinicalActId vigente)
                    └── Settlement slice   (SettlementId; informativo)
```

El Product Epic **no** vuelve a proyectar COD si PCC ya entrega el grano necesario. No llama a v1–v5.

### Qué se muestra

| Campo funcional | Origen certificado | Nota |
|-----------------|-------------------|------|
| Encounter | `encounterId` + `operationalContext.encounterStatus` | Ausente Encounter → no mint |
| Acto vigente | `clinicalHandoff.clinicalActId` | Solo si `present` |
| Kind (receta / visit summary) | `clinicalHandoff.documentKind` | Un kind; PCC-9 |
| Entrega | `clinicalHandoff.deliveredAt` | Documento **visible** solo si ≠ null |
| Estado del acto | `clinicalHandoff.state` | Informativo; no dispara emisión |
| Estado comercial | `operationalContext.isPaid` + presencia de `SettlementId` | Informativo. **No** es CTA de pago |
| `asOf` | paquete PCC | Instantánea lógica; no “ahora” del browser |

`lockAnomaly` existe en PCC y **no** se recomienda como copy de paciente. Es señal de staff (Epic 2). Copiarla al portal no repara nada y confunde. El diseño, si se autoriza, debe tratarla como no-superficie o como omisión explícita, no como cubo.

### Estados de la vista (no son estados de dominio nuevos)

Son lecturas de slices ya certificados:

| Vista | Condición | Qué ve el paciente |
|-------|-----------|---------------------|
| `available` | paquete derivable | Encounter + bloques según slices |
| `document_delivered` | handoff `present` ∧ `deliveredAt != null` | Kind + hecho de entrega |
| `document_not_delivered` | handoff `present` ∧ `deliveredAt == null` | Estados; sin documento entregado |
| `handoff_absent` | handoff `present: false` | Ausencia explícita; no mint de acto |
| `operational_absent` | contexto operativo ausente | Encounter/comercial no inventados |

No hay máquina de estados del portal. No hay `portal_opened` / `document_viewed` persistido.

### Relación con el portal legado

Ya existe `app/portal/**` (citas, historial, pagos, perfil, register) y Core lo declara **fuera de dominio / no reabrir**.

Epic 6 **no reemplaza** ese árbol. Añade, cuando se autorice, **solo** la ruta de consulta clínica `/portal/encounter/[encounterId]`. El index `/portal` existente no se reescribe. Historial de citas no se convierte en cola PCC. Pagos no se reutilizan (violaría READ ONLY).

`appointment id` ≠ `EncounterId`. Este Epic no inventa un mapeo-identidad entre ambos.

### Auth

Este Epic no modifica Auth. Si la ruta nueva vive bajo el route group ya autenticado del portal, hereda sesión **sin** tocar `PortalShell`. Autorizar que *este* Encounter pertenece a *este* paciente es un **gate de lectura**, no una quinta identidad. Si ese gate no existe como puerto certificado, el diseño deberá declararlo como riesgo; no se resuelve mintando `PatientPortalId`.

### Métricas (PRODUCT-1, numéricas)

Candidatas; el diseño las cierra:

| Métrica | Significado |
|---------|-------------|
| `portalEncounterAvailable` | 0/1 — paquete derivable |
| `portalHandoffPresent` | 0/1 |
| `portalDocumentDelivered` | 0/1 — handoff presente y `deliveredAt != null` |
| `portalDocumentKind` | 0 ninguno, 1 visit summary, 2 prescription |
| `portalCommerciallyPaid` | 0/1 — informativo; no filtra el documento |

Invariante esperable: `portalDocumentDelivered` implica `portalHandoffPresent`. Pago no implica ni oculta entrega.

---

## 6. Riesgos

| ID | Riesgo | Mitigación funcional |
|----|--------|----------------------|
| P0 | Reabrir el **patient portal** congelado en Core (citas, pagos, Auth, `PortalShell`) | Solo archivo **nuevo** de ruta Encounter. Cero edits a páginas/layout/servicios legado. |
| P0 | Writes desde el portal (cancelar, pagar, emitir, reenviar) | READ ONLY. Cero `run*` / `ensure*` / `observe*` / `persist*` / `save*`. Cero botones de esas acciones. |
| P0 | Nueva identidad (`PatientPortalId`, `PortalDocumentId`, `DeliveryId`, `HistoryId`) | Solo las cuatro oficiales. |
| P0 | Tratar Completion/Settlement como write o leer sus stores/UI | Solo slices vía COD → PCC. |
| P1 | Duplicar Epic 1 (cola de no entregados) | Membresía de documento visible = **entregado**. Staff sigue en `/panel/entrega-clinica`. |
| P1 | Duplicar Epic 2 (cubos, `lockAnomaly` como trabajo) | Comercial informativo (`isPaid`). Sin cubos. Sin CTA a integridad de ingresos. |
| P1 | Duplicar Epic 3/4 (línea / brief por `patientId`) | Un Encounter. No `patientId` como clave de producto. |
| P1 | Montar chrome de `/panel` o componentes de cierre | Superficie `/portal/...` nueva. Cero `PanelLayout`, `ContinuityPanelShell`, `EncounterClosureSection`. |
| P1 | Mostrar cuerpo/PDF no certificado en COD/PCC | Este Epic muestra metadatos certificados. Visor de bytes = incidente aparte. |
| P1 | Confundir `appointment id` del historial con `EncounterId` | URL `[encounterId]`. No reutilizar `fetchPortalAppointments` como fuente. |
| P1 | LocalStorage / SessionStorage / clock como fuente | Misma regla que v1–v5: React state de carga OK; no es dominio. |
| P2 | Exponer `lockAnomaly` o audit chains al paciente | Omitir en superficie. Siguen en COD/Epic 2 para staff. |
| P2 | Gate paciente↔Encounter inexistente | Declarar en diseño; no mint de identidad; no relajar Auth freeze. |
| P2 | Campo `encounterStatus` / settlement más rico en COD que en PCC | Preferir PCC. No reentrar COD salvo hueco de campo **autorizado** en diseño. |

Ningún riesgo de esta lista autoriza modificar Core ni v1.0–v5.0.

---

## 7. Superficies

### Autorizadas (cuando exista diseño + implementación)

| Ruta | Rol |
|------|-----|
| `/portal/encounter/[encounterId]` | Única superficie de Product Platform v6.0. Consulta READ ONLY de un Encounter. |

Archivos **nuevos** previstos (no crearlos ahora):

- `lib/product-platform/patient-portal/**`
- `app/portal/encounter/[encounterId]` (en App Router: página nueva; el route group `(app)` puede envolverla **sin** editar `layout.tsx` existente)
- `docs/EPIC_6_PATIENT_PORTAL_*.md`

Separada **completamente** de `/panel`. No reutilizar componentes administrativos.

### No son superficie de este Epic

- `/portal` index existente, `/portal/citas`, `/portal/citas/[id]`, `/portal/historial`, `/portal/pagos`, `/portal/perfil`, `/portal/register`, `/portal/reclamar`
- `/panel/**` (todas las rutas v1–v5 y ficha Encounter)
- Sidebar / overflow de panel (freeze)

No hay entrada nueva en chrome RC-19A. El paciente llega por URL de Encounter (y, si el diseño lo autoriza, un enlace **nuevo** que no edite historial legado).

---

## 8. Exclusiones

No tocar:

- CORE_PLATFORM  
- ARCHITECTURE_BASELINE  
- RC-19A (Sprint 1/2, `PanelLayout`, overlay, listado, FAB, Copilot, `ContinuityPanelShell`, `EncounterActionMenu`, D1/D17/D18/D19)  
- Clinical Completion (módulo, UI, mount en cierre)  
- Commercial Settlement (módulo, UI, mount en cierre)  
- Clinical Operations Projection  
- Patient Care Continuity  
- Product Platform v1.0–v5.0 (módulos y páginas `/panel/...`)  
- Auth, Workspace, Foundation, Branding, WebRTC  
- Portal legado (páginas, `PortalShell`, `lib/services/patient-portal`)  
- `EncounterClosureSection.tsx` / página Encounter  

No permitir en este Epic:

- editar, firmar, emitir, pagar, bloquear, reenviar;
- modificar actos; ejecutar workflows;
- nuevos dominios, identidades o estados persistidos;
- LocalStorage / SessionStorage / Browser State como fuente;
- backend nuevo;
- listado de pacientes; pulso; cola; cubos;
- recortar por pago el documento clínico.

Barrel v1.0 (`lib/product-platform/index.ts`) **no** exporta este Epic (igual que v2–v5).

---

## 9. Criterios PASS / FAIL

### PASS (si se autoriza diseño e implementación)

| ID | Criterio |
|----|----------|
| PP-1 | READ ONLY. Cero writes de Core o de Product v1–v5. |
| PP-2 | Cero `run*` / `ensure*` / `observe*` / `persist*` / `save*`. |
| PP-3 | Consume únicamente PCC (y COD transitivo). Completion/Settlement solo como slices ya proyectados. |
| PP-4 | No consume ni reimplementa v1.0–v5.0. |
| PP-5 | Clave = `EncounterId`. Un `ClinicalActId` vigente. Sin identidades nuevas. |
| PP-6 | Documento presentado como entregado solo si `deliveredAt != null`. Pago no filtra (PCC-5). |
| PP-7 | Comercial informativo. Cero CTA de pago / lock / factura. |
| PP-8 | Superficie solo `/portal/encounter/[encounterId]`. Cero chrome `/panel`. Cero componentes administrativos. |
| PP-9 | Cero edits a portal legado, Auth, Branding, RC-19A, Core, v1–v5. |
| PP-10 | Proyección determinista. Sin LocalStorage / SessionStorage / clock como fuente. Paquete no persistido. |
| PP-11 | PRODUCT-1: métricas numéricas. PRODUCT-2: Objective, Dependencies, Read Model, No Writes, PASS, Metrics. |
| PP-12 | Cero regresiones sobre Core Platform y Product Platform v1.0–v5.0. |

### FAIL

- Cualquier write, mint de identidad, o nuevo estado de dominio.
- Modificar un file freeze (Core, RC-19A, v1–v5, portal legado, Auth).
- Reutilizar `PanelLayout`, ficha Encounter, Delivery Queue, Revenue Integrity, Operational Pulse, `ContinuityPanelShell`.
- Llamar loaders de v1–v5 para armar la vista del paciente.
- Usar `fetchPortalAppointments` / pagos / cancelación como fuente clínica.
- Tratar `appointment id` como `EncounterId`.
- Persistir la vista. LocalStorage clínico. Reloj en la proyección.
- Ocultar el documento entregado porque `isPaid === false`.

Certificación futura (si se autoriza) es **evidencia**, no corrección. Un FAIL = incidente independiente.

---

## 10. Recomendación de implementación

**¿Debe existir como Epic independiente dentro de Product Platform?** **Sí** (candidato **v6.0**, solo tras diseño autorizado).

**¿Alguna capacidad existente cubre completamente ese caso de uso?** **No.**

- v1.0 cubre el *no* entregado para staff.  
- v2.0–v5.0 cubren clínica / médico en `/panel`.  
- COD/PCC cubren el átomo, **sin** UI de paciente.  
- El portal legado cubre citas y pago, **con writes**, y está **congelado** en Core.

**¿Reutilizar Product Platform v1.0–v5.0 como fuente?** **No.** Membresías y actores distintos; están frozen.  
**¿Reutilizar COD y PCC?** **Sí, en solo lectura.** Unidad: `ContinuityPackage`. Completion y Settlement solo vía esa proyección.

Cuando (y solo cuando) haya **aprobación explícita de diseño**:

1. Contrato PRODUCT-2 en `lib/product-platform/patient-portal/**` (proyección pura + loader).  
2. Página nueva `/portal/encounter/[encounterId]`, copy en español, `data-testid`, sin botones de write.  
3. No editar `lib/product-platform/index.ts` (barrel v1.0).  
4. No editar páginas, layout ni servicios del portal legado.  
5. Tests del Epic + no regresión Core y v1–v5.  
6. Certificación solo con autorización posterior; no “arreglar” en el acto de certificar.

**No implementar ahora. No diseñar ahora.**

El siguiente paso, si se autoriza, es **diseño** (PRODUCT-2). No código.
