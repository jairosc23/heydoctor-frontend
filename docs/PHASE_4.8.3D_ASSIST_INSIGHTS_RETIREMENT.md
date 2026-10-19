# Phase 4.8.3D — Assist / Insights Retirement™

**Objetivo:** Dos experiencias IA visibles — **Clinical Copilot™** + **LiveAiNoteSuggestions™** — sin pérdida de infraestructura.

**Base:** Frontend `caaf9c33` (4.8.3C) · Backend `c10e284` (sin cambios)

---

## UX antes / después

### Antes

- Tab **Asistencia** con ConsultationAssistPanel + AiInsightsPanel + Chat
- Duplicación con Clinical Copilot™

### Después

| Superficie | Estado |
|------------|--------|
| **Clinical Copilot™** | Hub único IA (determinístico + generativo) |
| **LiveAiNoteSuggestions™** | IA contextual inline en SOAP |
| **Autollenado ficha** | Sin cambios |
| **Tab Chat** | Solo ChatPanel (mensajería, no IA) |
| Tab Asistencia | **Retirado** |
| Assist / Insights panels | **Desmontados** en `[id]` |

---

## Componentes retirados (UI)

- `ConsultationAssistPanel` — mount en EncounterLeftPane / Mobile
- `AiInsightsPanel` — mount en EncounterLeftPane / Mobile
- Tab **Asistencia** — reemplazado por tab **Chat**

---

## Componentes deprecados (código conservado)

| Archivo | Estado |
|---------|--------|
| `ConsultationAssistPanel.tsx` | `@deprecated` — export legacy |
| `AiInsightsPanel.tsx` | `@deprecated` — export legacy |
| `CopilotHubCta.tsx` | Conservado, sin mount |

---

## Dependencias remanentes

- `ClinicalAiFacade™` — sin cambios (`getConsultationAssist`, `getConsultationInsights`, …)
- `lib/services/consultation-assist.ts` — transporte interno
- `ConsultationContext.appendNotesFromAi` — usado solo por Insights legacy (4.8.3E)

---

## Chat — destino futuro

Reubicado a tab **Chat** en pane izquierdo / mobile. Destino propuesto en 4.8.3E / teleconsulta: panel comunicaciones o sesión de teleconsulta dedicada.

---

## Riesgos detectados

1. **appendNotesFromAi** desde Insights — sin equivalente UI en Copilot (4.8.3E).
2. **GET insights cacheado** — facade disponible, sin panel dedicado post-retiro.
3. **Legacy `/panel/consultas`** — sin drawer Copilot; LiveAiNotes + Chat únicamente.

---

## Auditoría

`lib/assist-insights-retirement-audit.ts` + test automatizado de mounts prohibidos.
