# Phase 4.8.3A — Clinical AI Facade™

**Objetivo:** Capa única de orquestación IA en frontend. Sin cambios UX, backend ni comportamiento observable.

**Base validada:** Frontend `c550a86b` (4.8.2) · Backend `c10e284` (sin cambios)

---

## Arquitectura antes / después

### Antes

```
LiveAiNoteSuggestions ──► lib/services/ai-clinical.ts
ConsultationAssistPanel ──► lib/services/consultation-assist.ts
AiInsightsPanel ──► lib/services/consultations.ts (fetchConsultationAi)
ClinicalRecordPanel ──► lib/services/clinical-record.ts (autofillClinicalRecord)
```

Métricas, request IDs y hooks de throttling inconsistentes entre rutas.

### Después

```
Clinical Copilot™ (motor local determinístico — fuera del facade generativo)
LiveAiNoteSuggestions™ ──┐
ConsultationAssistPanel ───┤
AiInsightsPanel ───────────┼──► ClinicalAiFacade™ (lib/clinical-ai-facade.ts)
ClinicalRecordPanel ───────┘         │
                                     ▼
                          Servicios transporte interno
                          (consultation-assist, consultations, clinical-record)
                                     │
                                     ▼
                               Backend NestJS (sin cambios)
```

---

## Consumidores migrados

| Componente | Método facade | Operación |
|------------|---------------|-----------|
| `LiveAiNoteSuggestions.tsx` | `requestEnrichedClinicalDocumentation` | inline_note_suggestions |
| `ConsultationAssistPanel.tsx` | `getConsultationAssist` | consultation_assist |
| `AiInsightsPanel.tsx` | `getConsultationInsights` | consultation_insights |
| `ClinicalRecordPanel.tsx` | `autofillStructuredRecord` | autofill_record |

---

## Endpoints centralizados (payloads sin cambios)

| Operación | Backend | Transporte interno |
|-----------|---------|-------------------|
| inline_note_suggestions | POST `/consultation-assist` → fallback POST `/ai/consultation-summary` | facade + consultation-assist |
| consultation_summary | POST `/ai/consultation-summary` | facade → heydoctorApi |
| consultation_assist | POST `/consultation-assist` | consultation-assist.ts |
| consultation_insights | GET `/consultations/:id/ai` | consultations.ts |
| autofill_record | POST `/consultations/:id/ai/autofill-record` | clinical-record.ts |

---

## Normalización en facade

- **Request IDs:** `createClinicalAiRequestId()` en cada operación
- **Errores:** `humanizeAiClinicalError`, `isAiRateLimitError`
- **Métricas:** `recordAiResponseMetric` con `requestId` y kinds unificados
- **Throttling hooks:** `registerClinicalAiBeforeRequestHook(operation, requestId)`

---

## NO implementado (fases posteriores)

- Retiro de Assist / Insights / Tab Asistencia
- Redirects hacia Copilot (4.8.3C)
- Copilot Generative Section (4.8.3B)
- Cambios backend o payloads

---

## Riesgos detectados

1. **Copilot header** permanece en `clinical-copilot-intelligence.ts` (determinístico) — no pasa por facade generativo; coherente con 4.8.2.
2. **Tests de validación** (`clinical-ai-validation`, `clinical-real-validation`) siguen importando re-export `services/ai-clinical` — aceptable (no UI).
3. **`services/index.ts`** mantiene re-export legacy — componentes deben usar `@/lib/clinical-ai-facade`.

---

## Validación

```bash
npm run typecheck
npm test
npm run build
```

Auditoría automatizada: `lib/clinical-ai-facade-audit.ts` + `lib/clinical-ai-facade.test.ts`

---

## Archivos clave

- `lib/clinical-ai-facade.ts` — implementación facade
- `lib/clinical-ai-facade-audit.ts` — inventario y scan de violaciones
- `lib/services/ai-clinical.ts` — re-export compatibilidad tests 4.5.x
- `lib/ai-response-metrics.ts` — kinds `consultation_insights`, `autofill_record`
