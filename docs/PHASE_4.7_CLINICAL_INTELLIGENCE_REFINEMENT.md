# Phase 4.7 — Clinical Intelligence Refinement™

## Objetivo

Auditoría clínica completa del Clinical Copilot Intelligence™ (Phase 4.6) **sin modificar el motor ni agregar funcionalidades**. Validar utilidad real para el médico durante consulta y definir refinamientos antes de Clinical Agents™ o Analytics™.

**Base auditada:** Frontend `b6423c49` · Backend `c10e284` (sin cambios)

---

## Metodología (4.7A)

- Motor evaluado: `buildClinicalCopilotIntelligence` (`lib/clinical-copilot-intelligence.ts`)
- Batería: **20 escenarios** en `lib/clinical-copilot-audit.ts`
- Datos: SOAP real + Clinical Memory + Clinical Data Foundation (vitals, PE, longitudinal)
- Clasificación por ítem: **Útil** · **Neutro** · **Ruido** · **Potencialmente incorrecto**
- Sin IA · Sin mocks nuevos · Sin cambios al producto

---

## Resumen agregado

| Métrica | Valor |
|---------|-------|
| Escenarios evaluados | 20 |
| Insights generados (total) | 13 |
| Risk signals generadas (total) | 25 |
| Documentation gaps (total) | 5 |
| Quality score promedio | **75 / 100** |
| Cobertura insights especializados (I10/E11/J45) | **30%** (6/20) |
| Ítems útiles | 20 |
| Ítems neutros | 2 |
| Ítems ruido | 21 |
| Falsos positivos documentados | 22 |
| Falsos negativos documentados | 8 |

**Conclusión principal:** El Copilot aporta valor clínico real en **HTA, DM2 y Asma**, pero genera **ruido sistemático** (`risk-baseline`, duplicaciones, redundancia con Memory/Timeline/DNA) y **silencio clínico** en 14/20 patologías sin reglas especializadas.

---

## Tabla de auditoría por escenario (4.7A)

| Categoría | CIE-10 | Insights | Risk Signals | Gaps | Quality | Clasificación |
|-----------|--------|----------|--------------|------|---------|---------------|
| HTA | I10 | PA elevada; intervalo control; longitudinal | PA elevada [mod]; control vencido [mod] | Examen CV | 85 Excelente | útil=4 ruido=2 |
| DM2 | E11.9 | HbA1c; metformina; alerta | Alerta [mod]; labs pendientes [bajo] | Peso | 70 Adecuado | útil=5 ruido=1 |
| Asma | J45.9 | Inhaladores; sin exacerbaciones | Baseline [bajo] | — | 85 Excelente | neutro=1 ruido=2 |
| EPOC | J44.9 | — | Baseline [bajo] | — | 85 Excelente | ruido=1 |
| Hipotiroidismo | E03.9 | — | Labs pendientes [bajo] | — | 70 Adecuado | útil=1 |
| Obesidad | E66.9 | — | Baseline [bajo] | — | 85 Excelente | ruido=1 |
| Cefalea | R51 | — | Baseline [bajo] | — | 60 Adecuado | ruido=1 |
| Lumbalgia | M54.5 | — | Baseline [bajo] | — | 70 Adecuado | ruido=1 |
| ERGE | K21.9 | — | Baseline [bajo] | — | 60 Adecuado | ruido=1 |
| IR aguda | J06.9 | — | Baseline [bajo] | — | 85 Excelente | ruido=1 |
| Parkinson | G20 | — | Baseline [bajo] | — | 70 Adecuado | ruido=1 |
| FA | I48 | — | Alerta anticoag [mod] | — | 70 Adecuado | útil=1 |
| Artrosis | M19.90 | — | Baseline [bajo] | — | 60 Adecuado | ruido=1 |
| Ansiedad | F41.9 | — | Baseline [bajo] | — | 70 Adecuado | ruido=1 |
| Depresión | F32.9 | — | Baseline [bajo] | — | 70 Adecuado | ruido=1 |
| Niño sano | Z00.129 | — | Baseline [bajo] | — | 70 Adecuado | ruido=1 |
| Preventivo | Z00.00 | — | Baseline [bajo] | — | 85 Excelente | ruido=1 |
| Polimedicado | I10 | PA registrada (normal) | Baseline [bajo] | Examen CV | 85 Excelente | útil=1 neutro=1 ruido=1 |
| Sin controles | I10 | PA elevada; intervalo; longitudinal | PA [alto]; alerta; control vencido | Examen CV | 85 Excelente | útil=5 ruido=2 |
| Multi-dx HTA+DM2 | I10 | PA elevada | PA [mod]; labs [bajo] | Examen CV | 85 Excelente | útil=3 ruido=1 |

---

## Tabla de hallazgos (4.7A + 4.7B)

| # | Hallazgo | Severidad | Clasificación |
|---|----------|-----------|---------------|
| H1 | `risk-baseline` aparece en 14/20 escenarios sin riesgo real | Alta | Ruido |
| H2 | Duplicación PA elevada: insight `hta-vitals` + risk `risk-elevated-bp` | Alta | Ruido |
| H3 | Insights de medicación (`dm2-rx`, `asma-rx`) duplican Clinical Memory™ | Media | Ruido |
| H4 | `longitudinal-context` duplica Clinical Timeline™ | Media | Ruido |
| H5 | `asma-stable` infiere control por ausencia de alertas | Media | Potencialmente incorrecto |
| H6 | Solo I10/E11/J45 tienen reglas de insight — 70% patologías sin output | Alta | Falso negativo sistémico |
| H7 | Comorbilidad HTA+DM2: solo reglas HTA activas (código principal) | Alta | Falso negativo |
| H8 | Polimedicado: sin insight de polifarmacia/interacciones | Media | Falso negativo |
| H9 | Gaps HTA (`gap-pe-cv`) útiles pero ausentes en otros crónicos | Baja | Oportunidad |
| H10 | Quality 85 "Excelente" en IR aguda sin PE estructurado | Media | Sobreestimación |
| H11 | Sin ranking visual — todos los bloques mismo peso en drawer | Alta | UX clínica |
| H12 | FA genera risk útil por alerta memoria — modelo correcto | — | Útil (patrón a replicar) |

---

## Tabla de falsos positivos (4.7B)

| Escenario | Ítem | Motivo |
|-----------|------|--------|
| 14 escenarios | `risk:risk-baseline` | Placeholder verde "sin riesgo" sin valor clínico |
| audit-hta-control | `insight:longitudinal-context` | Redundante con Timeline UI |
| audit-hta-control | `risk:risk-elevated-bp` | Duplica insight PA elevada |
| audit-dm2-seguimiento | `insight:dm2-rx` | Metformina ya visible en Memory |
| audit-asma-estable | `insight:asma-rx` | Inhaladores ya en Memory |
| audit-asma-estable | `insight:asma-stable` | Inferencia por ausencia ≠ control clínico |
| audit-asma-estable | `risk:risk-baseline` | Coexiste con escenario que sí tiene datos |
| audit-sin-controles | `insight:longitudinal-context` | Redundante con Timeline |
| audit-sin-controles | Duplicación PA insight+risk | Mismo dato, dos bloques |
| audit-polimedicado | `insight:hta-vitals` (normal) | PA 134/84 — insight obvio, bajo valor |
| Múltiples | Quality "Excelente" | Score ≥85 sin examen físico estructurado |

---

## Tabla de falsos negativos (4.7B)

| Escenario | Esperado | Motivo |
|-----------|----------|--------|
| EPOC | Insight/spacing control EPOC | Sin reglas J44 |
| Hipotiroidismo | Contexto TSH/levotiroxina | Sin reglas E03 |
| Obesidad | Insight IMC/peso aunque documentado | Sin reglas E66 |
| ERGE | Continuidad tratamiento IBP | Sin reglas K21 |
| Parkinson | Seguimiento neurológico | Sin reglas G20 |
| FA | Insight anticoagulación (solo alerta risk) | Sin reglas I48 |
| Polimedicado | Alerta polifarmacia | Sin reglas polimedicación |
| Multi-dx HTA+DM2 | Reglas DM2 (HbA1c en memoria) | Solo código principal I10 |

---

## Fase 4.7B — Eliminación de ruido (propuesta, NO implementado)

| Target | Propuesta | Acción |
|--------|-----------|--------|
| `risk-baseline` | Eliminar | Ocultar bloque o mostrar vacío |
| `dm2-rx`, `asma-rx` | Eliminar | Memory UI ya cubre |
| `longitudinal-context` | Eliminar | Timeline UI ya cubre |
| `dna-context` | Condicionar | Solo si aporta patrón no en memoria paciente |
| `asma-stable` | Eliminar | Inferencia clínicamente débil |
| `hta-vitals` (PA normal) | Refinar | Solo si elevada o gap previo |
| PA insight + risk | Fusionar | Un solo artefacto prioritario |
| `gap-notes` (<20 chars) | Refinar | Excluir Z-codes y agudos |
| `gap-followup-text` | Refinar | Ampliar regex seguimiento |

---

## Fase 4.7C — Priorización clínica (diseño, NO implementado)

### Risk Signals

| Prioridad | Patrón | Ejemplo |
|-----------|--------|---------|
| **CRÍTICO** | Alertas critical; PA ≥160 | HTA descompensada |
| **ALTO** | Alertas warning; PA 140-159; control ≥6 meses | FA anticoag; HTA sin control |
| **MODERADO** | Labs pendientes ≥2; control 4-5 meses | DM2 labs acumulados |
| **INFORMATIVO** | Lab pendiente único; baseline | Ocultar baseline |

### Documentation Gaps

| Prioridad | Gap | Contexto |
|-----------|-----|----------|
| **ALTO** | PA ausente (HTA); motivo ausente | Mínimo SOAP |
| **MODERADO** | Examen CV (HTA); peso (DM2); seguimiento | Crónicos |
| **INFORMATIVO** | Anamnesis breve | Agudos / pediatría |

### Insights

| Prioridad | Patrón | Contexto |
|-----------|--------|----------|
| **ALTO** | Alertas DM2; HbA1c; intervalo control HTA; PA elevada | Accionable |
| **INFORMATIVO** | Medicación; longitudinal; DNA; asma-stable | Redundante — suprimir o colapsar |

**Principio UI:** Risk CRÍTICO/ALTO → Gaps ALTO → Insights ALTO → resto colapsado bajo "Contexto adicional".

---

## Fase 4.7D — Quality Score Audit (propuesta calibración, NO implementado)

### Hallazgos

| Problema | Evidencia |
|----------|-----------|
| **Sobreestima** | IR aguda, EPOC, preventivo → 85 Excelente sin PE |
| **Favorece cantidad** | Anamnesis ≥30 chars = 15 pts sin evaluar contenido |
| **Subestima consultas breves** | Niño sano / cefalea válidas penalizables por gap-notes |
| **No diferencia crónicos** | HTA Excelente posible sin examen CV documentado |

### Propuesta de calibración

1. Anamnesis: 15→10 pts; umbral ≥50 chars O hallazgo clínico parseable
2. Excelente (≥85): requerir vitals **O** examen físico además de dx + plan
3. Excluir gap-notes en Z00* y consultas agudas J/R
4. Ampliar regex seguimiento: `reevaluar|volver|retorno|próxima|cita`
5. No mostrar "Excelente" en crónicos I10/E11 sin vitals
6. Mantener score informativo — sin gamificación ni bloqueo

---

## Recomendaciones clínicas

1. **Eliminar `risk-baseline`** — mayor ROI de refinamiento, cero pérdida clínica
2. **Fusionar duplicados PA** — un solo mensaje prioritario
3. **Suprimir insights redundantes con Memory/Timeline/DNA**
4. **Implementar ranking CRÍTICO→INFORMATIVO** antes de Agents o IA adicional
5. **Ampliar reglas determinísticas** (EPOC, FA, hipotiroidismo) en fase post-4.7
6. **Soportar comorbilidades** — evaluar reglas por condiciones activas, no solo dx principal
7. **Calibrar Quality Score** — menos longitud, más completitud estructurada
8. **Reordenar drawer** — Quality compacto arriba; Risk priorizado; Context Engine colapsable abajo

---

## Riesgos detectados

- Utilidad percibida baja fuera de HTA/DM2/Asma — riesgo de abandono del Copilot
- `risk-baseline` verde puede inducir falsa seguridad
- `asma-stable` puede transmitir control no verificado
- Quality "Excelente" sin PE puede falsear percepción documental
- Duplicación insight↔risk erosiona confianza del médico
- Sin ranking, información crítica (PA 162/102) compite visualmente con ruido
- Comorbilidades ignoradas — gap clínico relevante en población real

---

## Archivos de auditoría

| Archivo | Rol |
|---------|-----|
| `lib/clinical-copilot-audit.ts` | Motor de auditoría + 20 escenarios |
| `lib/clinical-copilot-audit.test.ts` | Validación batería Phase 4.7 |
| `docs/PHASE_4.7_CLINICAL_INTELLIGENCE_REFINEMENT.md` | Informe completo |

**No modificado:** `clinical-copilot-intelligence.ts` (motor Phase 4.6 intacto)

---

## Validación obligatoria

```bash
npm run typecheck   # PASS
npm test            # PASS (incluye clinical-copilot-audit)
npm run build       # PASS
```

Backend: sin cambios — no requiere commit.

---

## Veredicto Phase 4.7

| Dimensión | Evaluación |
|-----------|------------|
| Utilidad HTA/DM2/Asma | **Alta** — insights y risks accionables |
| Utilidad resto patologías | **Baja** — silencio clínico |
| Ruido visual | **Alta** — baseline + duplicaciones |
| Documentation Gaps | **Moderada** — útiles en HTA, genéricos limitados |
| Quality Score | **Moderada** — calibración necesaria |
| Listo para Clinical Agents™ | **No** — refinamiento 4.7B-D requerido primero |

El Clinical Copilot™ **sí ayuda parcialmente** al médico en crónicos cardiometabólicos documentados, pero **no está listo** para expandirse a IA agentica hasta eliminar ruido, priorizar clínicamente y ampliar cobertura determinística.
