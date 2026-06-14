# Phase 4.8.3C — Copilot Redirection Layer™

**Objetivo:** Dirigir gradualmente al usuario hacia Clinical Copilot™ como hub IA principal, sin retirar componentes legacy.

**Base:** Frontend `3e317aed` (4.8.3B) · Backend `c10e284` (sin cambios)

---

## Flujo UX antes / después

### Antes

Menú **«Análisis clínico con IA»** → tab Ficha + autollenado (`autofillRequest`).

Tab Asistencia, Copilot generativo y menú eran caminos separados.

### Después

Menú **«Análisis clínico con IA»** → abre **Clinical Copilot™** + expande **Clinical AI Assistant™**.

Tab Asistencia, Assist, Insights y autollenado de ficha **siguen funcionando**, con CTA suave hacia Copilot.

---

## Infraestructura creada

| Módulo | Rol |
|--------|-----|
| `context/CopilotNavigationContext.tsx` | `openCopilot`, `openCopilotSection("generative")`, `expandCopilotGenerativeSection` |
| `lib/copilot-navigation.ts` | Tipos, inventario entry points, helpers |
| `components/clinical/CopilotHubCta.tsx` | CTA «Disponible también desde Clinical Copilot™» |

Estado controlado desde `page.tsx` (`copilotDrawerOpen`, `generativeExpandToken`).

---

## Componentes integrados

- `ClinicalCopilotDrawer` — recibe `generativeExpandToken`
- `CopilotGenerativeSection` — auto-expande cuando `expandRequestToken` incrementa
- `ConsultationAssistPanel` / `AiInsightsPanel` — `CopilotHubCta`
- `page.tsx` — `CopilotNavigationProvider` + `handleAnalyzeWithAi` redirigido

---

## Entry points redirigidos

| Entry point | Comportamiento 4.8.3C |
|-------------|------------------------|
| Menú ⋯ Análisis clínico con IA | → Copilot + generative expand |
| EncounterActionMenu `onAnalyzeWithAi` | → idem |
| ClinicalModuleSheet `onAnalyzeWithAi` | → idem |
| Tab Asistencia / Assist / Insights | Sin cambios + CTA hub |
| Ficha Autollenar con IA | Sin cambios |
| LiveAiNoteSuggestions | Sin cambios |

---

## Riesgos detectados

1. **Duplicación temporal** — menú y Tab Asistencia pueden llevar a experiencias IA distintas hasta 4.8.3D.
2. **Legacy `/panel/consultas`** — sin `CopilotNavigationProvider`; CTA oculto (hook optional).
3. **Autollenado ficha** — ya no se dispara desde menú; sigue disponible en botón de ficha.

---

## Archivos clave

- `context/CopilotNavigationContext.tsx`
- `lib/copilot-navigation.ts` + test
- `docs/PHASE_4.8.3C_COPILOT_REDIRECTION_LAYER.md`
