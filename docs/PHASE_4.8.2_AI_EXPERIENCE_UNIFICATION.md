# Phase 4.8.2 — AI Experience Unification™

## Objetivo

Reducir entry points IA de **≈7 a máximo 2** sin perder capacidad clínica existente.

**Base:** Frontend `25bc5c96` · Backend `c10e284` (sin cambios)

**Alcance:** solo auditoría y diseño — **sin eliminar código, sin cambios UX**.

---

## Pregunta central

> ¿Cómo reducimos la complejidad de la experiencia IA sin perder ninguna capacidad clínica existente?

**Respuesta:** Concentrar inteligencia **determinística** en Clinical Copilot™ y asistencia **generativa inline** en LiveAiNoteSuggestions™; migrar capacidades de Assist, Insights y autofill dispersos al Copilot (opt-in) y a un facade de servicios compartido, preservando los 5 endpoints backend actuales bajo una API frontend unificada.

---

## 1. Inventario completo de entry points IA

### Activos en `/panel/consultas/[id]` (7)

| # | ID | Trigger | Backend |
|---|-----|---------|---------|
| 1 | Copilot header ✨ | Usuario | Motor local 4.7D |
| 2 | Tab **Asistencia** | Usuario | (contenedor) |
| 3 | Assist → «Obtener sugerencias» | Usuario | POST `/consultation-assist` |
| 4 | Insights → auto-load | Automático | GET `fetchConsultationAi` |
| 5 | Menú ⋯ **Análisis clínico con IA** | Usuario | POST `autofill-record` → **Ficha** |
| 6 | Ficha → **Autollenar con IA** | Usuario | POST `autofill-record` |
| 7 | **LiveAiNoteSuggestions** | Automático (Notas SOAP) | assist + summary fallback |

### Inactivos / legacy (2)

| ID | Notas |
|----|-------|
| ConsultationActionBar chip IA | Código existe; **no montado** en `[id]` |
| `/panel/consultas` inline | Redirect normal a `[id]` |

### Fuera de alcance IA generativa

| Componente | Tratamiento |
|------------|-------------|
| **ChatPanel** | Reubicar — mensajería, no IA |
| **Doctor DNA™** | Mantener separado — analítica determinística |

---

## 2. Mapa de dependencias

```
EncounterHeader
  └── ClinicalCopilotDrawer
        └── buildClinicalCopilotIntelligence (local)
        └── usePatientClinicalMemory, useDoctorDna

EncounterLeftPane tab Asistencia
  ├── ConsultationAssistPanel → POST /consultation-assist
  ├── AiInsightsPanel → GET fetchConsultationAi
  └── ChatPanel (no IA)

SoapSection bloque Notas
  └── LiveAiNoteSuggestions
        └── requestEnrichedClinicalDocumentation
              ├── POST /consultation-assist (primario)
              └── POST /ai/consultation-summary (fallback)

EncounterActionMenu / ClinicalRecordPanel
  └── autofillClinicalRecord → POST /consultations/:id/ai/autofill-record

page.tsx
  ├── aiTrigger state
  ├── handleAnalyzeWithAi → tab Ficha + autofill
  └── copilotDrawerOpen
```

Detalle: `lib/ai-experience-unification-audit.ts` → `AI_DEPENDENCY_MAP`

---

## 3–5. Respuestas a las 5 preguntas

### 1. ¿Qué componente debe ser la experiencia IA principal?

**Clinical Copilot™** (`ClinicalCopilotDrawer` + `buildClinicalCopilotIntelligence`)

- Inteligencia determinística de consulta (Quality, Gaps, Risks, Insights).
- Futuro contenedor opt-in para generativo (Assist + Insights + autofill ficha).

### 2. ¿Qué componentes son redundantes?

| Componente | Redundancia |
|------------|-------------|
| **AI Insights Panel™** | Duplica summary/improvedNotes/dx con LiveAiNotes y Assist |
| **Consultation Assist Panel™** | Solapa diferenciales/educación con Insights |
| **Menú Análisis IA** | Duplica Autollenar Ficha; comportamiento distinto al label |
| **Tab Asistencia** | Agrupa 3 experiencias no relacionadas |
| **ConsultationActionBar chip IA** | Código muerto duplicando menú |

### 3. ¿Qué componentes pueden fusionarse?

| Fusión propuesta | Resultado |
|------------------|-----------|
| Assist + Insights → **Copilot «Asistencia generativa»** (colapsada) | 1 superficie generativa bajo demanda |
| Menú Análisis IA + Autollenar Ficha → **Copilot acción «Completar ficha»** | 1 trigger autofill-record |
| `requestEnrichedClinicalDocumentation` + `fetchConsultationAi` → **ClinicalAiFacade** | 1 API frontend documentación |

### 4. ¿Qué componentes deben retirarse?

- Tab **Asistencia** (post-migración)
- **AiInsightsPanel** (montaje en encounter)
- **ConsultationAssistPanel** (montaje en encounter)
- Menú ⋯ **Análisis clínico con IA**
- Chip IA en **ConsultationActionBar.tsx**
- Stack IA inline en **`/panel/consultas/page.tsx`**

### 5. ¿Qué componentes deben permanecer?

| Componente | Rol |
|------------|-----|
| **Clinical Copilot™** | Hub principal |
| **LiveAiNoteSuggestions™** | Asistente contextual Notas |
| **ClinicalRecordPanel** | Captura ficha (botón autofill → consolidar en Copilot) |
| **Doctor DNA™ drawer** | Analítica médico (no IA generativa encounter) |
| **ChatPanel** | Comunicación (reubicar fuera de Asistencia) |

---

## 6. Riesgos de migración

| ID | Riesgo | Severidad |
|----|--------|-----------|
| MR-1 | Hábito tab Asistencia para diferenciales | Alta |
| MR-2 | `appendNotesFromAi` desincronizado con page state | Media |
| MR-3 | Rate limit 429 compartido assist/LiveAiNotes | Media |
| MR-4 | Menú «Análisis IA» hoy va a Ficha, no Copilot | Alta |
| MR-5 | Tests 4.5.x acoplados a paneles separados | Baja |
| MR-6 | 4–5 endpoints backend sin consolidar | Baja |

---

## 7. Arquitectura IA objetivo

```
┌─────────────────────────────────────────────────────────┐
│  ENTRY POINT 1 — Clinical Copilot™ (header ✨)            │
│  ├─ Determinístico: Quality, Gaps, Risks, Insights      │
│  ├─ Generativo (opt-in colapsado): diferenciales        │
│  └─ Acción: Completar ficha → autofill-record           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ENTRY POINT 2 — LiveAiNoteSuggestions™ (SOAP Notas)    │
│  └─ Sugerencias debounced al escribir → insertar texto  │
└─────────────────────────────────────────────────────────┘

         ClinicalAiFacade (lib futura)
              ├── getInlineNoteSuggestions()
              ├── getGenerativeAssist()
              └── autofillStructuredRecord()
```

**Regla central:** el médico nunca pregunta «¿Qué IA debo usar?»

---

## 8. Plan de transición

| Paso | Fase | Acción |
|------|------|--------|
| 1 | **4.8.2** | Audit + diseño (este documento) |
| 2 | 4.8.3a | `clinical-ai-facade.ts` — unificar consumo |
| 3 | 4.8.3b | Sección generativa en Copilot drawer |
| 4 | 4.8.3c | Redirect menú/tab → Copilot; flag ocultar Asistencia |
| 5 | 4.8.3d | Retirar mounts Assist + Insights; reubicar Chat |
| 6 | 4.8.3e | Limpieza legacy + validar 2 entry points |

---

## 9. Archivos afectados (implementación futura)

Ver `AI_EXPERIENCE_FILES_AFFECTED` en `lib/ai-experience-unification-audit.ts` (21 archivos).

**Creados en 4.8.2:**

- `lib/ai-experience-unification-audit.ts`
- `lib/ai-experience-unification-audit.test.ts`
- `docs/PHASE_4.8.2_AI_EXPERIENCE_UNIFICATION.md`

---

## Capacidades preservadas post-unificación

| Capacidad actual | Destino |
|------------------|---------|
| Quality / Gaps / Risks / Insights determinísticos | Copilot (sin cambio) |
| Diferenciales + educación generativa | Copilot sección opt-in |
| Summary / improvedNotes / suggestedDiagnosis | Copilot opt-in + LiveAiNotes inline |
| Autofill ficha estructurada | Copilot acción + Ficha (único botón) |
| Trazabilidad aiRunId | Facade / governance Copilot |
| Silence Mode 4.7B | Copilot determinístico intacto |

---

## Validación

```bash
npm run typecheck   # PASS
npm test            # PASS
npm run build       # PASS
```

---

## 12. Recomendación final

**Aprobar diseño 4.8.2** e iniciar **4.8.3a (ClinicalAiFacade)** como primer paso de implementación — sin retirar UI hasta paridad QA.

**No iniciar:** Agents, Analytics, nuevas Clinical Apps, módulos IA adicionales.

**Prioridad inmediata:** eliminar la ambigüedad del menú «Análisis clínico con IA» (hoy abre Ficha, no Copilot) en la primera iteración de implementación.
