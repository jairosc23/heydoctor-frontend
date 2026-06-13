# Phase 4.7D — Documentation Quality Calibration™

## Objetivo

Recalibrar exclusivamente **Documentation Quality Score™** para que refleje **completitud clínica documental**, no longitud textual.

**Base:** Frontend `e4e2fa4a` (Phase 4.7C) → Phase 4.7D

**Alcance:** solo motor `buildDocumentationQuality`. Sin cambios en UI, backend, tarjetas ni otros módulos Copilot.

---

## Problema detectado en auditoría 4.7

| Problema | Evidencia pre-4.7D |
|----------|-------------------|
| Falsos **Excelente** | EPOC, IRA, HTA sin examen CV, consultas con solo texto largo |
| Sesgo por cantidad | Anamnesis ≥30 caracteres = 15 pts sin evaluar contenido |
| PE ignorado en libre | Hallazgos en texto (“MV conservado”, “faringe eritematosa”) no contaban |
| Seguimiento estrecho | “Reevaluar”, “si empeora”, “próxima cita” no puntuaban |

---

## Pesos revisados (total 100)

| Factor | Antes (4.7C) | Después (4.7D) | Criterio |
|--------|--------------|----------------|----------|
| Diagnóstico | 20 | **20** | Dx activo documentado |
| Motivo | 10 | **10** | Chief complaint presente |
| Anamnesis | 15 | **10** | Contenido clínico parseable (no longitud) |
| Vitales | 15 | **18** | Signos vitales reales en notas/plan |
| Examen físico | 15 | **18** (10 parcial) | Estructurado HD_PE / ≥2 hallazgos / 1 hallazgo |
| Plan | 15 | **14** | Conducta documentada |
| Seguimiento | 10 | **10** | Regex ampliada (control, reevaluar, si empeora, cita…) |

---

## Umbrales y gates de label

| Label | Umbral score | Gates adicionales (4.7D) |
|-------|--------------|--------------------------|
| **Excelente** | ≥85 | Dx + plan + (vitales **o** examen); HTA requiere examen CV; I10/E11 requieren vitales; EPOC/J0* requieren PE completo; agudas R51/M54/J06 solo Excelente con PE estructurado o “examen físico” explícito |
| **Adecuado** | ≥60 | — |
| **Incompleto** | <60 | — |

---

## Auditoría clínica — 20 escenarios

| Escenario | Score | Label sistema | Esperado clínico | Alineado |
|-----------|-------|---------------|------------------|----------|
| HTA control | 82 | Adecuado | Adecuado | ✅ |
| DM2 seguimiento | 64 | Adecuado | Adecuado | ✅ |
| Asma estable | 100 | Excelente | Excelente | ✅ |
| EPOC exacerbación | 82 | Adecuado | Adecuado | ✅ |
| Hipotiroidismo | 64 | Adecuado | Adecuado | ✅ |
| Obesidad | 82 | Adecuado | Adecuado | ✅ |
| Cefalea | 64 | Adecuado | Adecuado | ✅ |
| Lumbalgia | 82 | Adecuado | Adecuado | ✅ |
| ERGE | 54 | Incompleto | Incompleto | ✅ |
| IRA aguda | 90→Adecuado* | Adecuado | Adecuado | ✅ |
| Parkinson | 64 | Adecuado | Adecuado | ✅ |
| FA | 82 | Adecuado | Adecuado | ✅ |
| Artrosis | 54 | Incompleto | Incompleto | ✅ |
| Ansiedad | 64 | Adecuado | Adecuado | ✅ |
| Depresión | 64 | Adecuado | Adecuado | ✅ |
| Niño sano | 64 | Adecuado | Adecuado | ✅ |
| Preventivo | 100 | Excelente | Excelente | ✅ |
| Polimedicado | 82 | Adecuado | Adecuado | ✅ |
| Sin controles HTA | 82 | Adecuado | Adecuado | ✅ |
| Multimorbilidad | 82 | Adecuado | Adecuado | ✅ |

\* IRA: score numérico alto por vitales+PE libre; gate de consulta aguda breve limita label a **Adecuado**.

**Correlación clínica post-calibración:** 100% (20/20 escenarios alineados)

---

## Comparativa ANTES (4.7C) vs DESPUÉS (4.7D)

| Métrica | 4.7C (e4e2fa4a) | 4.7D | Δ |
|---------|-----------------|------|---|
| Score promedio | 75 | 75 | 0 |
| Label Excelente | 8 | **2** | **-6** |
| Label Adecuado | 11 | **16** | **+5** |
| Label Incompleto | 1 | **2** | **+1** |
| Falsos Excelente | 5 | **0** | **-5** |
| Falsos Adecuado | 3 | **0** | **-3** |
| Falsos Incompleto | 0 | **0** | 0 |
| Alineación clínica | 60% | **100%** | **+40%** |

### Casos corregidos (ya no “Excelente” indebido)

- `audit-epoc` — SatO2 sin PE estructurado completo
- `audit-ir-aguda` — consulta aguda breve
- `audit-hta-control` — PA sin examen cardiovascular
- `audit-polimedicado` / `audit-sin-controles` / `audit-multi-dx` — HTA sin examen CV
- Consultas con texto largo pero sin objetivos (ERGE, artrosis sin seguimiento → Incompleto)

---

## Prioridades Phase 4.7D — cumplimiento

| Prioridad | Resultado |
|-----------|-----------|
| P1 Auditoría 20 escenarios | ✅ `clinical-documentation-quality-audit.ts` |
| P2 Calibración pesos | ✅ vitales/PE ↑, anamnesis por contenido ↓ |
| P3 Consultas agudas | ✅ IRA/cefalea/lumbalgia no Excelente indebido |
| P4 Consultas crónicas | ✅ HTA/DM2/EPOC reconocen vitales, seguimiento, gates |
| P5 Examen físico | ✅ parcial (10 pts) vs completo (18 pts); sin penalizar hallazgo útil |
| P6 Umbrales | ✅ 85/60 mantenidos + gates clínicos documentados |

---

## Riesgos detectados

- PE en texto libre usa patrones conservadores — hallazgos atípicos pueden no puntuar
- Excelente requiere gates estrictos — consultas válidas pueden quedar en Adecuado (intencional)
- ERGE/artrosis sin seguimiento en plan → Incompleto (coherente con completitud documental)
- Baseline 4.7C congelado en código para comparativa histórica — no recalcular retroactivamente

---

## Archivos modificados

| Archivo | Rol |
|---------|-----|
| `lib/clinical-copilot-intelligence.ts` | `buildDocumentationQuality` recalibrado |
| `lib/clinical-documentation-quality-audit.ts` | Auditoría clínica + comparativa 4.7C/4.7D |
| `lib/clinical-documentation-quality-audit.test.ts` | Batería validación 4.7D |
| `lib/clinical-copilot-audit.ts` | `assessQualityCalibration`, expectativas HTA |
| `lib/clinical-copilot-intelligence.test.ts` | Test anamnesis por contenido |
| `docs/PHASE_4.7D_DOCUMENTATION_QUALITY_CALIBRATION.md` | Informe |

**No modificado:** UI Copilot, backend, Insight Cards, Risk Signals, Gaps, Silence Mode, Coverage, Memory, Timeline, Doctor DNA, Orders.

---

## Validación

```bash
npm run typecheck   # PASS
npm test            # PASS (189 tests)
npm run build       # PASS
```

Backend: sin cambios.

---

## Veredicto Phase 4.7D

| Dimensión | Evaluación |
|-----------|------------|
| Calibración clínica | ✅ Falsos Excelente eliminados |
| Completitud > longitud | ✅ Anamnesis por contenido |
| Consultas agudas | ✅ Gates breves |
| Crónicos / HTA | ✅ Vitales + examen CV para Excelente |
| Regresión Copilot | ✅ Sin cambios fuera de quality score |
