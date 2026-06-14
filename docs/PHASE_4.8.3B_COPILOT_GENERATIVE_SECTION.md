# Phase 4.8.3B — Copilot Generative Section™

**Objetivo:** Nuevo hogar de IA generativa dentro de Clinical Copilot™, sin retirar superficies legacy.

**Base:** Frontend `e4b86fa2` (4.8.3A) · Backend `c10e284` (sin cambios)

---

## UX antes / después

### Antes

El médico abre **Clinical Copilot™** y obtiene solo inteligencia **determinística**:

- Risk Signals
- Documentation Gaps
- Documentation Quality
- Insights

Para ayuda **generativa** debe ir al **Tab Asistencia** (Assist / Insights).

### Después

Misma experiencia determinística **sin cambios**, más una sección nueva al final del drawer:

```
… (secciones determinísticas existentes)

▸ Clinical AI Assistant™   ← colapsada por defecto
    [ Generar análisis clínico ]   ← acción explícita
    ↓
    Resumen clínico
    Diagnósticos diferenciales
    Conducta sugerida
    Educación al paciente
    Seguimiento
```

**Tab Asistencia**, **ConsultationAssistPanel** e **AiInsightsPanel** permanecen intactos.

---

## Componente creado

| Archivo | Rol |
|---------|-----|
| `app/panel/consultas/[id]/_components/copilot/CopilotGenerativeSection.tsx` | UI colapsable + estados loading/error/success |
| `lib/copilot-generative-section.ts` | Mapeo puro assist → secciones UX |

---

## Integración ClinicalAiFacade™

- Única llamada generativa: `getConsultationAssist()` desde `@/lib/clinical-ai-facade`
- Payload: `chiefComplaint`, `notes` (contexto de la consulta abierta)
- Sin nuevos endpoints ni servicios

---

## Estados

| Estado | Comportamiento |
|--------|----------------|
| **Idle** | Sección colapsada; sin llamadas IA |
| **Loading** | Spinner + skeleton tras clic en «Generar análisis clínico» |
| **Success** | Cinco bloques mapeados desde `ConsultationAssistResponse` |
| **Error** | `humanizeAiClinicalError` → fallback `getApiErrorMessage` |

Gobernanza visible: *«No reemplaza juicio clínico profesional.»*

---

## NO implementado (fases posteriores)

- Retiro Tab Asistencia / Assist / Insights
- Redirects desde menús legacy (4.8.3C)
- Auto-generación al expandir
- Cambios en LiveAiNoteSuggestions, Documentation Quality o motor determinístico

---

## Riesgos detectados

1. **Resumen clínico** se deriva del contexto documentado (motivo/notas/dx), no de un campo summary del backend — coherente con shape actual de `ConsultationAssistResponse`.
2. **Seguimiento** se infiere de recomendaciones con patrón heurístico; si el backend no distingue, puede mostrar fallback genérico.
3. **Duplicación temporal** con Tab Asistencia hasta 4.8.3C/D — intencional en esta fase.

---

## Archivos modificados

- `ClinicalCopilotDrawer.tsx` — monta `CopilotGenerativeSection` tras Documentation Gaps
