# Phase 4.6 — Clinical Copilot Intelligence™

## Objetivo

Primera versión real del Clinical Copilot como **asistente de contexto clínico** — sin chatbot, sin agente autónomo, sin diagnósticos automáticos ni prescripción.

## Entregables

| Prioridad | Feature | Implementación |
|-----------|---------|----------------|
| 1 | Clinical Insight Cards™ | `buildClinicalInsightCards` — HTA, DM2, asma, longitudinal, Doctor DNA |
| 2 | Clinical Risk Signals™ | `buildClinicalRiskSignals` — reglas Bajo/Moderado/Alto |
| 3 | Documentation Gaps™ | `buildDocumentationGaps` |
| 4 | Documentation Quality™ | `buildDocumentationQuality` — score 0–100 |
| 5 | Copilot Context Engine v2™ | `buildCopilotContextV2` — Clinical Data Foundation |

## Archivos clave

- `lib/clinical-copilot-intelligence.ts` — motor determinístico
- `lib/clinical-copilot-intelligence.test.ts` — batería Phase 4.6
- `app/panel/consultas/[id]/_components/copilot/` — UI drawer y bloques
- `lib/clinical-copilot-mock.ts` — governance/acciones; re-exports v2

## Restricciones

- NO sugerir diagnósticos
- NO emitir conclusiones clínicas definitivas
- NO IA en risk signals
- NO gamificación en quality score
- NO tocar: SOAP Engine, Clinical Summary v2, Timeline UI, Memory UI, Orders, Design System

## Validación

```bash
npm run typecheck
npm test
npm run build
```

## Riesgos detectados

- Insights dependen de memoria clínica cargada vía API — sin paciente, contexto limitado a SOAP actual
- Risk signals usan reglas heurísticas (PA ≥140/90, controles >4 meses) — no sustituyen evaluación clínica
- Documentation Quality es informativo; no bloquea flujo
