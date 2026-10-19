# Phase 4.5.2 — Clinical Data Foundation™

**Base frontend:** `8567922b` (Phase 4.5.1)  
**Objetivo:** Normalizar vitales, examen físico y contexto longitudinal para AI Documentation, Clinical Summary y Copilot — sin nuevos módulos IA ni cambios de UX.

---

## Auditoría de almacenamiento — Signos vitales

| Campo | Backend (`consultations`) | UI dedicada | Fuente Phase 4.5.2 |
|-------|---------------------------|-------------|---------------------|
| PA (sistólica/diastólica) | ❌ | ❌ | Texto libre en `notes` / marcador `[[HD_VS_V1]]` |
| FC | ❌ | ❌ | Idem |
| FR | ❌ | ❌ | Idem |
| Temperatura | ❌ | ❌ | Idem |
| SatO2 | ❌ | ❌ | Idem |
| Peso | ❌ | ❌ | Idem |
| Talla | ❌ | ❌ | Idem |
| IMC | ❌ | ❌ | Calculado solo si peso+talla documentados |

**Conclusión:** No existían columnas ni inputs UI. La foundation lee **solo datos explícitos** del médico.

---

## Módulos implementados

### ClinicalVitalSignsContext™

- **Archivo:** `lib/clinical-vital-signs-context.ts`
- Parse marcador `[[HD_VS_V1]]` en `notes`
- Extracción conservadora desde texto libre (PA, FC, FR, Temp, SatO2, peso, talla, IMC)
- `formatClinicalVitalSignsForContext()` → prompt IA

### PhysicalExamFramework™

- **Archivo:** `lib/physical-exam-framework.ts`
- 9 secciones: General, HEENT, Cardiovascular, Respiratorio, Abdomen, Neurológico, Extremidades, Piel, Otros
- Fuentes: marcador `[[HD_PE_V1]]` + revisión por sistemas legacy (`[[HD_CR_V1]]`)
- **Vacío = vacío** — sin placeholders ficticios en SOAP

### LongitudinalSummary™

- **Archivo:** `lib/longitudinal-summary.ts`
- Últimas 3 consultas desde `PatientClinicalMemory.recentConsultations`
- Excluye consulta activa
- **Gap:** motivo y conducta no están en DTO de memoria (null hasta ampliación backend)

### Clinical Data Foundation (agregador)

- **Archivo:** `lib/clinical-data-foundation.ts`
- Integrado en `buildClinicalAiContextPrompt()` y `formatStructuredClinicalNote()`

---

## Integración (sin cambio de UX)

| Consumidor | Cambio |
|------------|--------|
| `ai-clinical-context.ts` | Inyecta foundation en prompt |
| `clinical-summary-quality.ts` | Examen físico real o sección omitida |
| `ai-clinical.ts` | Pasa `encounterNotes` + `currentConsultationId` |
| `LiveAiNoteSuggestions.tsx` | Cablea foundation al request enriquecido |

**No modificado:** Timeline UI, Memory UI, Copilot UI, layout, WebRTC, Doctor DNA, Orders.

---

## Backend — Consultation Summary Enrichment (solo propuesta)

Ver: [`docs/PHASE_4.5.2_BACKEND_CONSULTATION_SUMMARY_AUDIT.md`](./PHASE_4.5.2_BACKEND_CONSULTATION_SUMMARY_AUDIT.md)

---

## Riesgos

1. Vitales dependen de texto libre hasta UI/columnas dedicadas — parsing puede no capturar todos los formatos.
2. Longitudinal sin motivo/conducta limita continuidad asistencial.
3. Marcadores HD_VS/HD_PE en `notes` comparten espacio con HD_CR — requiere convención de serialización futura.
4. Fallback `consultation-summary` sigue leyendo solo 4 campos BD.

---

## Validación

| Check | Resultado |
|-------|-----------|
| `npm run typecheck` | Ver commit |
| `npm test` | Ver commit |
| `npm run build` | Ver commit |
