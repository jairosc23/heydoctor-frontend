# Prescription Engine Enterprise — Phase 1 Audit

**ID:** `PRESCRIPTION-ENGINE-ENTERPRISE-PHASE-1`  
**Tipo:** Auditoría funcional + técnica (sin implementación)  
**Fecha:** 2026-07-22  
**Baseline FE Production:** `5f4434b3cff4dc696c5e79494f06c2a60a0b4f92`  
**Baseline BE Production:** `e5364190ebeac61f94181c4a9bfb692962e4401c`  
**Rama:** `feature/prescription-engine-enterprise`  
**STATUS:** AUDIT COMPLETE — Phase 0 Clinical Design next (no PR-1 until PO approval)  
**Siguiente:** `PRESCRIPTION-ENGINE-ENTERPRISE-PHASE-0-CLINICAL-DESIGN.md`

---

## 1. Estado actual del motor de recetas

HeyDoctor tiene un **prescriptor MVP operativo** (CRUD + PDF + Orders shell), apoyado por una **foundation backend enterprise parcial** (vademécum, smart suggestions, favoritos, outbox/graph).

| Capa | Madurez | Resumen |
|------|---------|---------|
| Backend EMR Nest | Media-Alta | Entidad, DTO rico, PDF, catálogo, smart ranking |
| Backend CDSS | Baja | `DrugSafetyCheckService` stub (`warnings: []`, `blocked: false`) |
| Frontend clínico | Baja-Media | UI de 3 campos (nombre/dosis/frecuencia) + notas |
| Catálogo FE | Baja | Solo `suggest-medications` → `string[]` (deprecated path) |
| Favoritos FE | Ausente | BE tiene `/clinical-preferences/favorite-drugs`; FE no consume |
| Plantillas / refills | Ausente | Labs sí tienen templates; Rx no |
| FHIR MedicationRequest | Ausente en Nest | Solo legado Strapi mínimo |
| Copilot HITL Rx | Estructural | Slots vacíos / `READY_TO_CONNECT`; no escribe EMR |

**Veredicto:** no improvisar campos en el panel actual. Evolucionar sobre Nest + vademécum; rediseñar UX FE y cerrar CDSS.

---

## 2. Arquitectura existente

```text
Encounter / Orders Command Center
  └─ PrescriptionPanel (FE)
       ├─ MedicationSuggestInput → GET /prescriptions/suggest-medications (string[])
       ├─ CRUD → POST/PATCH/DELETE /prescriptions
       └─ PDF → GET /prescriptions/:id/pdf

Backend Nest (heydoctor-backend-pro)
  ├─ PrescriptionsModule (CRUD, normalize, PDF, soft cancel)
  ├─ SmartPrescriptionModule (ranking + DrugSafetyCheck stub)
  ├─ ClinicalCatalog / Vademecum (substances, presentations, routes, ATC)
  ├─ ClinicalPreferences (favorite-drugs, usage stats)
  ├─ DocumentTemplateEngine (PDF + QR + validationCode)
  └─ Outbox → Clinical Knowledge Graph (PRESCRIPTION_*)

Paralelos (no SoT productivo)
  ├─ AI PrescriptionSkill (draft only, no persist)
  ├─ Medical Copilot governed Rx panels (HITL structural)
  └─ Strapi / nest-backend / FHIR legacy
```

---

## 3. Arquitectura propuesta

### Principios
1. **Reuse + Extend** el núcleo Nest (no greenfield).
2. **Presentation-first:** línea de Rx anclada a `drugPresentationId` (+ snapshot).
3. **CDSS real** antes de declarar “enterprise”.
4. **FE consume APIs ya existentes** (catalog, smart-suggestions, favorites).
5. **FHIR como adapter** Nest (nuevo), no ampliar Strapi.
6. **AI/Copilot** permanece draft/HITL; persistencia solo vía Prescription Engine.

### Capas objetivo

```text
Prescription Engine
  ├─ Catalog Gateway (presentations, INN, strength, form, route)
  ├─ Composer UI (structured line items + quantity engine)
  ├─ Clinical Safety Gate (allergies, ATC duplicate, contraindications)
  ├─ Persistence (versioned prescriptions + audit)
  ├─ Document (PDF / print / signed hash)
  ├─ Continuity (favorites, templates, refills)
  └─ Interop Adapter (FHIR MedicationRequest — fase posterior)
```

---

## 4. Modelo de datos

### Actual — `Prescription` + `medications` JSONB

```ts
MedicationItemDto {
  name?: string;                 // required if no presentation
  drugPresentationId?: string;   // optional UUID
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;                // auto-fill from presentation
  instructions?: string;
}
```

Receta: `patientId`, `consultationId?`, `cie10CodeId?`, `diagnosis?`, `notes?`, `validationCode`, `digitalSignatureHash`, `status: active|cancelled`.

### Propuesto (evolución, no ruptura)

| Campo | Origen | Acción |
|-------|--------|--------|
| `drugPresentationId` | BE ya | Exigir en UI enterprise; permitir free-text legacy |
| Snapshot presentación | Nuevo | Congelar label/INN/strength/form/route al firmar |
| `quantity` / `daysSupply` | Nuevo | Cálculo + override médico |
| `refills` | Nuevo | Recetas repetidas |
| `indication` por línea | Nuevo o mapear | Separar de `notes` globales |
| `patientInstructions` | Mapear `instructions` | Exponer en UI |
| Version / re-sign | Nuevo | Append-only o bump hash en update |

**Vademécum reutilizable:** `DrugSubstance`, `DrugPresentation`, `DrugRoute`, `DrugTherapeuticGroup`, synonyms, jurisdictions.  
**CDSS schema dormant:** contraindications / pregnancy / lactation / age (`isActive: false`) — activar runtime.

---

## 5. Modelo UI

### Actual
- Lista Orders (`UnifiedOrderCard`)
- Form: diagnóstico + N× (suggest nombre, dosis, frecuencia) + notas
- Acciones: Editar / PDF / Eliminar

### Propuesto (enterprise composer)
1. **Header:** paciente, consulta, diagnóstico CIE-10.
2. **Line editor:** presentación (catalog picker), INN (read-only), concentración, forma, vía, dosis, frecuencia, duración, cantidad (auto + edit), indicación, instrucciones paciente.
3. **Safety strip:** alergias / duplicidad / warnings (HITL).
4. **Continuity:** favoritos, plantillas, “repetir última”.
5. **Actions:** Guardar, PDF/imprimir, cancelar (soft).

Mantener shell Orders Command Center; reemplazar formulario interno.

---

## 6. Componentes reutilizables

| Componente / módulo | Decisión |
|---------------------|----------|
| `PrescriptionPanel` shell + Orders cards | Reutilizar / extender |
| `MedicationSuggestInput` | Rediseñar contrato → objetos tipados |
| `orders-command-center` | Reutilizar |
| `downloadClinicalPdf` | Reutilizar |
| BE `PrescriptionsService` + PDF engine | Reutilizar |
| BE Vademecum + SmartPrescription | Reutilizar (conectar FE) |
| BE Favorite drugs API | Reutilizar (exponer en FE) |
| Lab templates pattern | Copiar patrón para Rx templates |
| Clinical Flow `innName` / `drugPresentationId` | Alinear; dejar de descartar al apply |
| Copilot governed Rx panels | No promover como editor clínico |
| Strapi FHIR converter | Descartar como base |

---

## 7. Archivos involucrados

### Frontend
- `lib/services/prescriptions.ts`
- `components/clinical/PrescriptionPanel.tsx`
- `components/clinical/MedicationSuggestInput.tsx`
- `lib/orders-command-center.ts`
- `app/panel/consultas/[id]/_components/OrdersTab.tsx`
- `lib/apply-unified-clinical-plan.ts`
- `lib/types/clinical-foundation.ts`, `clinical-memory.ts`, `clinical-intelligence-flow.ts`
- Copilot HITL (referencia, no SoT): `lib/medical-copilot/.../governed-prescription-*`

### Backend
- `src/prescriptions/*`
- `src/smart-prescription/*` (`drug-safety-check.service.ts` stub)
- `src/clinical-catalog/vademecum/*`
- `src/clinical-preferences/*`
- `src/clinical-documents/document-template-engine.service.ts`
- `src/ai/prescription.skill.ts` (draft only)

---

## 8. Riesgos

1. **Safety theater:** CDSS stub → riesgo clínico (alergias ignoradas).
2. **Brecha FE↔BE:** DTO soporta duration/route/instructions/presentation; UI no.
3. **Pérdida semántica:** Clinical Flow descarta `drugPresentationId` al crear Rx.
4. **Update in-place sin re-firma/versionado.**
5. **Doble canal PDF** (receta CRUD vs signed-prescription de consulta).
6. **Confusión Copilot vs Orders** (draft vacío vs editor real).
7. **Triplicidad histórica** Strapi / nest-backend / Nest canónico.
8. **FHIR prematuro** sobre modelo free-text.

---

## 9. Dependencias

| Dependencia | Tipo |
|-------------|------|
| Vademécum seed / jurisdicción (CL+) | Datos |
| Patient profile allergies shape | CDSS |
| CIE-10 linkage | Existente |
| Document PDF engine | Existente |
| Orders Command Center UX | Existente |
| Clinical preferences APIs | Existente, FE pending |
| Outbox / graph | Existente |
| FHIR MedicationRequest | Futuro (fase interop) |
| eRx / farmacia / ISP | Fuera de alcance inicial |

---

## 10. Plan de implementación por fases (PRs independientes)

| PR | Nombre | Scope | Capa |
|----|--------|-------|------|
| **PR-0** | Audit lock | Este documento; freeze scope | Docs |
| **PR-1** | Catalog-aware FE client | Tipar presentations; APIs catalog + smart-suggestions; deprecar string suggest en UI nueva | FE (+ contratos) |
| **PR-2** | Structured Composer UI | Exponer duration/route/instructions/quantity; presentation picker | FE |
| **PR-3** | Safety Gate v1 | CDSS alergias + ATC duplicate; warnings tipados; no bloquear hard salvo policy | BE (+ FE strip) |
| **PR-4** | Continuity | Favoritos FE + plantillas Rx + “repetir” | FE + BE templates |
| **PR-5** | Integrity | GET `:id`; version/re-sign on update; audit update/cancel | BE |
| **PR-6** | Quantity engine | Cálculo cantidad / daysSupply + PDF | FE + BE |
| **PR-7** | FHIR adapter | MedicationRequest Nest (read/export) | BE |
| **PR-8** | Copilot bridge | Draft HITL → CreatePrescriptionDto (opt-in) | FE/BE bridge |

Cada PR: tests + typecheck + sin tocar telemedicina / workspace / AI generative core.

---

## 11. Estimación de impacto

| Área | Impacto |
|------|---------|
| Frontend clínico | Alto (rediseño composer) |
| Backend contratos | Medio (campos opcionales → required gradual) |
| Migraciones DB | Bajo-Medio (quantity/refills/version; JSONB extensible) |
| PDF | Medio (más campos en línea) |
| CDSS | Alto clínico / Medio código |
| Breaking API | Bajo si se mantiene free-text legacy |
| Producción risk | Medio — feature-flag composer recomendado |

---

## 12. Recomendación técnica

1. **No greenfield.** Reusar Nest prescriptions + vademécum + smart + PDF + outbox.
2. **Priorizar PR-1 → PR-3:** conectar catálogo + UI estructurada + safety real.
3. **Descartar** Strapi FHIR y el formulario de 3 campos como “producto enterprise”.
4. **No implementar FHIR ni eRx** hasta modelo de línea estable.
5. **Mantener AI/Copilot** fuera del write-path hasta PR-8.
6. Esperar **aprobación explícita del Product Owner** antes de cualquier PR de desarrollo.

---

## Matriz de capacidades (auditoría)

| Capacidad | BE | FE | Decisión |
|-----------|----|----|----------|
| Medicamento | Sí (name + presentation) | Parcial free-text | Extender FE |
| Principio activo | Sí (substance INN) | No en Rx UI | Exponer vía catalog |
| Concentración / forma | Sí (presentation) | No | Exponer |
| Vía | Sí (DTO + route entity) | Tipo sí / UI no | Exponer |
| Dosis / frecuencia | Sí | Sí (texto) | Estructurar + catálogos |
| Duración | Sí DTO | No UI | Exponer |
| Cantidad | No | No | Nuevo |
| Indicaciones / observaciones | notes globales | notes | Separar por línea |
| Instrucciones paciente | `instructions` | No UI | Exponer |
| Cálculo cantidad | No | No | Nuevo |
| Recetas repetidas | No | No | Nuevo |
| Plantillas | No | No (labs sí) | Nuevo |
| Favoritos | Sí API | No | Conectar FE |
| PDF / impresión | Sí | Sí | Extender campos |
| FHIR MedicationRequest | No Nest | No | Fase posterior |
| Validaciones clínicas | Stub | No | Implementar CDSS |
| Alergias al prescribir | Profile exists; no check | Context only | Safety Gate |
| Duplicidad terapéutica | No | No | Safety Gate (ATC) |
| Auditoría | Create + outbox | No | Extender update/cancel |
| Versionado | No | No | PR integrity |

---

**Fin Phase 1.** Sin código funcional. Sin merge. Sin deploy.
