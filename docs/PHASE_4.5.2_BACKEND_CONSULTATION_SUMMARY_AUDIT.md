# Phase 4.5.2 — Backend Clinical Summary Enrichment™ (Auditoría)

**Proyecto:** SAVAC-HeyDoctor/heydoctor-backend-pro  
**Endpoint:** `POST /ai/consultation-summary`  
**Estado:** Propuesta técnica — **NO implementado**

---

## 1. Estado actual

### Request DTO

```typescript
// consultation-summary-query.dto.ts
export class ConsultationSummaryQueryDto {
  @IsUUID('4')
  consultationId: string;
}
```

Solo acepta `consultationId`.

### Flujo (`ai.service.ts`)

1. Carga consulta por ID + validación multi-tenant
2. Construye `GenerateAiDto` desde BD:

| Campo GenerateAiDto | Origen BD |
|---------------------|-----------|
| `reason` | `consultation.reason` |
| `notes` | `consultation.notes` |
| `diagnosis` | `consultation.diagnosis` |
| `treatment` | `consultation.treatment` |

3. Llama OpenAI `generateClinicalSummary(dto)` — JSON estructurado
4. Throttle compartido: **10 req/min** (`AiController` `@Throttle`)

### Contexto que **recibe** hoy

- Motivo (`reason`)
- Notas (`notes`) — incluye bloques serializados HD_CR si el frontend los guardó
- Diagnóstico texto
- Plan/tratamiento

### Contexto que **pierde**

| Dato | Disponible en sistema | En summary |
|------|----------------------|------------|
| Edad / sexo paciente | `patients` | ❌ |
| CIE-10 estructurado | `cie10_code_id` | ❌ (solo texto `diagnosis`) |
| Clinical Memory | `ClinicalMemoryService` | ❌ |
| Medicación activa | prescripciones | ❌ |
| Laboratorios | lab orders | ❌ |
| Alertas clínicas | patient profile + rules | ❌ |
| Signos vitales | ❌ no persistidos | ❌ |
| Examen físico estructurado | ❌ no persistido | ❌ |
| Timeline (consultas previas) | consultations history | ❌ |
| Alergias | patient profile | ❌ |

---

## 2. Comparación con `consultation-assist`

| | consultation-assist | consultation-summary |
|--|---------------------|----------------------|
| Auth plan | Sin RequirePlan PRO | RequirePlan PRO |
| Body | chiefComplaint, symptoms, notes | consultationId only |
| Contexto | Enviado por cliente | Solo BD consulta activa |
| Límite texto | symptoms 8000, notes 12000 | N/A |

Phase 4.5 frontend enriquece **assist** vía `buildClinicalAiContextPrompt`; **summary fallback** no recibe ese contexto.

---

## 3. Propuesta DTO enriquecido (fase futura)

```typescript
export class ConsultationSummaryEnrichedDto {
  @IsUUID('4')
  consultationId: string;

  @IsOptional()
  @ValidateNested()
  vitalSigns?: ClinicalVitalSignsDto;

  @IsOptional()
  @ValidateNested()
  physicalExam?: PhysicalExamDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  longitudinalContext?: LongitudinalEntryDto[];

  /** Snapshot opcional — preferir resolución server-side desde patientId */
  @IsOptional()
  @IsUUID('4')
  patientId?: string;
}

export class ClinicalVitalSignsDto {
  @IsOptional() @IsInt() systolic?: number;
  @IsOptional() @IsInt() diastolic?: number;
  @IsOptional() @IsInt() heartRate?: number;
  @IsOptional() @IsInt() respiratoryRate?: number;
  @IsOptional() @IsNumber() temperatureC?: number;
  @IsOptional() @IsInt() oxygenSaturation?: number;
  @IsOptional() @IsNumber() weightKg?: number;
  @IsOptional() @IsNumber() heightCm?: number;
}

export class PhysicalExamDto {
  @IsOptional() @IsString() @MaxLength(2000) general?: string;
  @IsOptional() @IsString() @MaxLength(2000) heent?: string;
  // ... cardiovascular, respiratory, abdomen, neurological, extremities, skin, other
}

export class LongitudinalEntryDto {
  @IsISO8601() date: string;
  @IsOptional() @IsString() primaryDiagnosis?: string;
  @IsOptional() @IsString() chiefComplaint?: string;
  @IsOptional() @IsString() conduct?: string;
}
```

### Alternativa preferida (server-side enrichment)

Extender `generateClinicalSummaryForConsultation` para:

1. Resolver `patientId` desde consulta
2. Llamar `ClinicalMemoryService.getPatientMemory(patientId)`
3. Parsear vitales/examen desde `notes` con util compartido (o columnas futuras)
4. Cargar últimas 3 consultas con `reason` + `treatment`
5. Fusionar en `GenerateAiDto` ampliado o bloque user adicional

**Ventaja:** contexto autoritativo, sin confiar solo en payload cliente.

---

## 4. Cambios de persistencia recomendados (mediano plazo)

| Entidad | Campos propuestos |
|---------|-------------------|
| `consultations` | `vital_signs jsonb`, `physical_exam jsonb` |
| `ClinicalMemoryConsultationSummaryDto` | + `reason`, + `treatment` |

Migración TypeORM + backward compat: seguir leyendo marcadores en `notes` si jsonb vacío.

---

## 5. Throttling

Separar buckets:

- `consultation-assist`: 10/min (actual)
- `consultation-summary`: 20/min o cola por consulta

Evita degradación cuando assist falla y frontend dispara summary fallback.

---

## 6. Criterios de aceptación (implementación futura)

1. Summary recibe vitales cuando están documentados (BD o DTO)
2. Examen físico estructurado llega al prompt — sin inventar hallazgos
3. Longitudinal incluye motivo/conducta de consultas previas
4. Tests e2e `ai.service.spec.ts` con fixture enriquecido
5. Frontend puede enviar DTO opcional o depender de resolución server-side

---

## 7. Referencias código actual

- `heydoctor-backend-pro/src/ai/dto/consultation-summary-query.dto.ts`
- `heydoctor-backend-pro/src/ai/ai.service.ts` → `generateClinicalSummaryForConsultation`
- `heydoctor-backend-pro/src/ai/ai.controller.ts` → `@Post('consultation-summary')`
- `heydoctor-backend-pro/src/clinical-memory/dto/patient-clinical-memory.dto.ts`
