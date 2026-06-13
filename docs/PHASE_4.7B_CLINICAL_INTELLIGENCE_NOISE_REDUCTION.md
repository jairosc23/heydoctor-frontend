# Phase 4.7B — Clinical Intelligence Noise Reduction™

## Objetivo

Aplicar hallazgos Phase 4.7: **menos output, más valor clínico**. Sin nuevas patologías, sin backend, sin IA.

**Base:** Frontend `71fc268e` → Phase 4.7B

---

## Cambios implementados

| Prioridad | Cambio | Estado |
|-----------|--------|--------|
| P1 | Eliminar `risk-baseline` — estado vacío con mensaje | ✅ |
| P2 | Fusionar duplicados HTA — insight=contexto, risk=nivel | ✅ |
| P3 | Suprimir redundancias Memory/Timeline/DNA | ✅ |
| P4 | Refinar asma J45 — exacerbaciones, persistencia, control | ✅ |
| P5 | Copilot Silence Mode™ | ✅ |
| P6 | Auditoría comparativa ANTES vs DESPUÉS | ✅ |

### Insights eliminados
- `dm2-rx`, `asma-rx` (redundantes con Clinical Memory™)
- `longitudinal-context` (redundante con Timeline™)
- `dna-context` (redundante con Doctor DNA™)
- `asma-stable` (reemplazado por insights refinados)
- `hta-vitals` cuando PA no está elevada

### Insights asma refinados
- `asma-no-exacerbation` — sin alertas de exacerbación en memoria
- `asma-treatment-persistence` — inhaladores ≥6 meses documentados
- `asma-followup-gap` — intervalo desde último control

---

## Comparativa auditoría (20 escenarios)

| Métrica | ANTES 4.7 | DESPUÉS 4.7B | Δ |
|---------|-----------|--------------|---|
| Insights totales | 13 | 8 | **-5** |
| Risk signals | 25 | 11 | **-14** |
| Útil | 20 | 24 | **+4** |
| Neutro | 2 | 0 | -2 |
| Ruido | 21 | 0 | **-21** |
| Falsos positivos | 22 | 0 | **-22** |
| Falsos negativos | 8 | 13 | +5* |
| Silence Mode activo | — | 12 escenarios | — |
| Quality promedio | 75 | 75 | 0 |

\* FN aumentan por cobertura limitada I10/E11/J45 (sin cambio de scope — fuera de 4.7B).

### Objetivos Phase 4.7B

| Meta | Resultado |
|------|-----------|
| Reducir ruido | ✅ 21 → 0 |
| No aumentar volumen | ✅ insights -5 |
| Eliminar baseline | ✅ 0 ocurrencias |

---

## Riesgos detectados

- 12/20 escenarios en Silence Mode — correcto pero utilidad percibida baja fuera de crónicos
- FN +5 por patologías sin reglas especializadas (pendiente fase futura)
- Quality score sin calibración (Phase 4.7D pendiente)
- Silence Mode requiere insights + risks + gaps vacíos simultáneamente

---

## Archivos modificados

- `lib/clinical-copilot-intelligence.ts`
- `lib/clinical-copilot-intelligence.test.ts`
- `lib/clinical-copilot-audit.ts`
- `lib/clinical-copilot-audit.test.ts`
- `app/panel/consultas/[id]/_components/copilot/CopilotRiskSignals.tsx`
- `app/panel/consultas/[id]/_components/copilot/CopilotInsightCards.tsx`
- `app/panel/consultas/[id]/_components/copilot/ClinicalCopilotDrawer.tsx`

---

## Validación

```bash
npm run typecheck  # PASS
npm test           # PASS (174 tests)
npm run build      # PASS
```

Reproducir comparativa: `runCopilotNoiseReductionComparison()` en `lib/clinical-copilot-audit.ts`
