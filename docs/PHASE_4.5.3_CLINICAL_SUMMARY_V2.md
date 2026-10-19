# Phase 4.5.3 — Clinical Summary Backend Enrichment™

**Base:** Frontend `2e2af5c7` · Backend pre-v2  
**Decisión arquitectónica:** **Híbrido A+B**

| Capa | Responsabilidad |
|------|-----------------|
| **A — Backend** | Resuelve demografía, Clinical Memory, alergias, longitudinal (con motivo/conducta desde `Consultation`), vitales/examen parseados de `notes` |
| **B — Frontend** | Envía `clientSnapshot.clinicalContextPrompt` idéntico al bloque de `consultation-assist` para alinear fallback cuando el borrador difiere de BD |

**Compatibilidad:** `{ consultationId }` sigue siendo válido (v1).

---

## 1. Flujo actual (pre-4.5.3)

```
POST /ai/consultation-summary { consultationId }
  → AiService.generateClinicalSummaryForConsultation
  → GenerateAiDto { reason, notes, diagnosis, treatment }
  → OpenAI → JSON { summary, suggestedDiagnosis, improvedNotes }
```

**Servicios:** `AiService`, `AuthorizationService`, `AiGovernanceService`  
**No usaba:** `ClinicalMemoryService`, `Patient.profile`, parsing vitales/examen

---

## 2. Flujo Clinical Summary v2™

```
POST /ai/consultation-summary
  { consultationId, clientSnapshot? }
  → ClinicalSummaryContextService.resolveForConsultation
      ├── ClinicalMemoryService.getPatientClinicalRecords
      ├── Patient.profile (alergias)
      ├── parseClinicalVitalSigns(notes)
      ├── parsePhysicalExamFromNotes(notes)
      └── buildLongitudinalFromConsultations (reason + treatment)
  → GenerateAiDto + enrichedClinicalContext
  → OpenAI (SYSTEM_PROMPT v2 — secciones omitidas si vacías)
  → fallback: buildStructuredFallbackSummary (sin inventar)
```

---

## 3. DTO v2

```typescript
ConsultationSummaryQueryDto {
  consultationId: UUID;           // requerido
  clientSnapshot?: {
    clinicalContextPrompt?: string;  // max 12000
    chiefComplaint?: string;
    draftNotes?: string;
    treatment?: string;
    patientAge?: string;
    patientSex?: string;
  };
}
```

`GenerateAiDto` ampliado con `enrichedClinicalContext?: string`.

---

## 4. Datos recuperados vs perdidos

| Dato | v2 Backend | Fuente |
|------|------------|--------|
| Demografía | ✅ | `Patient.birthDate`, `Patient.sex` + snapshot |
| Alergias | ✅ | `PatientProfile.allergies` |
| Alertas | ✅ | Clinical Memory |
| Medicación | ✅ | Clinical Memory |
| Labs pendientes | ✅ | Clinical Memory |
| Vitales | ✅ | Parse `notes` / snapshot (no inventar) |
| Examen físico | ✅ | HD_PE / HD_CR en `notes` |
| Longitudinal | ✅ | Consultas previas + motivo + conducta |
| CIE-10 estructurado | ✅ | `cie10Code` relation |

**Aún no persistidos:** columnas dedicadas vitales/examen (marcadores en `notes`).

---

## 5. Archivos backend

- `src/ai/dto/consultation-summary-enriched-snapshot.dto.ts`
- `src/ai/clinical-summary/vital-signs.util.ts`
- `src/ai/clinical-summary/physical-exam.util.ts`
- `src/ai/clinical-summary/longitudinal.util.ts`
- `src/ai/clinical-summary/clinical-summary-context.service.ts`
- `src/ai/ai.service.ts` (v2 prompt + fallback)
- `src/ai/ai.module.ts` (+ ClinicalMemoryModule)

## 6. Archivos frontend

- `lib/services/ai-clinical.ts` — `buildConsultationSummaryRequest`
- `lib/clinical-summary-v2-validation.test.ts`
- `components/clinical/LiveAiNoteSuggestions.tsx` — pasa patientAge/Sex

---

## 7. Riesgos

1. `clientSnapshot` duplica contexto server — acceptable para consistencia assist/summary
2. Throttle 10/min sin cambio en esta fase
3. OpenAI puede aún omitir secciones aunque estén en input — fallback estructurado mitiga degradación
4. Alergias en profile dependen de formato jsonb consistente

---

## 8. Validación clínica (5 casos)

Batería en `lib/clinical-summary-v2-validation.test.ts` + `clinical-ai-validation.ts`  
Verifica payload v2 incluye vitales, memoria y prompt alineado con assist.
