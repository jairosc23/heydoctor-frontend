# Phase 4.7C — Clinical Intelligence Coverage™

## Objetivo

Ampliar cobertura clínica del Copilot manteniendo **Silence Mode™**, **Zero Noise™** y **Zero False Positives™**.

**Base:** Frontend `6d26088d` → Phase 4.7C

---

## Cobertura añadida

| Prioridad | Patología / Regla | Insights (evidencia requerida) |
|-----------|-------------------|-------------------------------|
| P1 | EPOC (J44) | `epoc-treatment-persistence`, `epoc-followup-gap` |
| P2 | Hipotiroidismo (E03) | `hypo-lab`, `hypo-treatment-persistence`, `hypo-followup-gap` |
| P3 | Obesidad (E66) | `obesity-longitudinal` (≥2 consultas previas), `obesity-followup-gap` |
| P4 | ERGE (K21) | `erge-treatment-persistence`, `erge-followup-gap` |
| P5 | Parkinson (G20) | `park-treatment-persistence`, `park-followup-gap` |
| P6 | Artrosis (M19) | `art-longitudinal`, `art-followup-gap` |
| P7 | FA (I48) | `fa-treatment-persistence`, `fa-followup-gap` |
| P8 | Polifarmacia | `polypharmacy-context` (≥5 medicamentos activos) |
| P9 | Multimorbilidad | `multimorbidity-context` (≥3 condiciones + longitudinal) |

### Regla de oro
Sin evidencia documentada → **Silence Mode**. No mensajes genéricos tipo "estable".

---

## Comparativa 4.7B vs 4.7C (20 escenarios)

| Métrica | 4.7B | 4.7C | Δ |
|---------|------|------|---|
| Insights totales | 8 | 21 | **+13** |
| Útil | 24 | 38 | **+14** |
| Neutro | 0 | 0 | 0 |
| Ruido | **0** | **0** | 0 |
| Falsos positivos | **0** | **0** | 0 |
| Falsos negativos | 13 | **0** | **-13** |
| Silence Mode | 12 | **7** | **-5** |
| Cobertura especializada | 25% | **65%** | **+40%** |

### Objetivos Phase 4.7C

| Meta | Resultado |
|------|-----------|
| Aumentar cobertura | ✅ 25% → 65% |
| Zero Noise | ✅ ruido = 0 |
| Zero False Positives | ✅ FP = 0 |
| Reducir silencio innecesario | ✅ 12 → 7 escenarios |

---

## Escenarios que permanecen en Silence Mode (correcto)

- Cefalea aguda (sin memoria crónica)
- Lumbalgia aguda
- IR aguda
- Niño sano / preventivo (sin gaps ni riesgo)
- Ansiedad / depresión (sin evidencia longitudinal en fixtures)

---

## Riesgos detectados

- Polifarmacia es conteo contextual — no evalúa interacciones (por diseño)
- Multimorbilidad requiere ≥3 condiciones activas + longitudinal
- Consultas agudas sin memoria siguen en silencio — comportamiento esperado
- Límite de 8 insights por consulta — prioridad a reglas específicas antes que transversales

---

## Archivos modificados

- `lib/clinical-copilot-intelligence.ts`
- `lib/clinical-copilot-intelligence.test.ts`
- `lib/clinical-copilot-audit.ts`
- `lib/clinical-copilot-audit.test.ts`

**UI Copilot:** sin cambios (Phase 4.7C solo motor)

---

## Validación

```bash
npm run typecheck  # PASS
npm test           # PASS (178 tests)
npm run build      # PASS
```

Reproducir comparativa: `runCopilotCoverageComparison()` en `lib/clinical-copilot-audit.ts`
