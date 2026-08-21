import type { NestConsultation, UpdateConsultationDto } from "./consultations";
import { parseDiagnosisLabel } from "./diagnosis";

export type DiagnosisSource = "empty" | "structured" | "parsed" | "free_text";

/** Fuente única de verdad del diagnóstico en el workspace de consulta. */
export interface ConsultationDiagnosisState {
  /** Texto legal: "CODE - Description" o libre */
  diagnosis: string;
  /** UUID FK — null = sin vínculo CIE-10 */
  cie10CodeId: string | null;
  /** Derivado — no se envía en PATCH */
  diagnosisCode: string;
  diagnosisDescription: string;
  source: DiagnosisSource;
}

export type DiagnosisBadgeVariant = "structured" | "parsed" | "free_text";

export function emptyDiagnosisState(): ConsultationDiagnosisState {
  return {
    diagnosis: "",
    cie10CodeId: null,
    diagnosisCode: "",
    diagnosisDescription: "",
    source: "empty",
  };
}

export function hydrateDiagnosisFromConsultation(
  c: Pick<
    NestConsultation,
    "diagnosis" | "cie10CodeId" | "cie10Code"
  >,
): ConsultationDiagnosisState {
  const diagnosis = c.diagnosis?.trim() ?? "";
  const cie10CodeId = c.cie10CodeId ?? c.cie10Code?.id ?? null;

  if (cie10CodeId) {
    const parsed = parseDiagnosisLabel(diagnosis);
    return {
      diagnosis,
      cie10CodeId,
      diagnosisCode: c.cie10Code?.code?.trim() || parsed?.code || "",
      diagnosisDescription:
        c.cie10Code?.descriptionEs?.trim() ||
        parsed?.description ||
        diagnosis,
      source: "structured",
    };
  }

  if (!diagnosis) {
    return emptyDiagnosisState();
  }

  const parsed = parseDiagnosisLabel(diagnosis);
  if (parsed) {
    return {
      diagnosis,
      cie10CodeId: null,
      diagnosisCode: parsed.code,
      diagnosisDescription: parsed.description,
      source: "parsed",
    };
  }

  return {
    diagnosis,
    cie10CodeId: null,
    diagnosisCode: "",
    diagnosisDescription: diagnosis,
    source: "free_text",
  };
}

/**
 * PATCH echo may omit the expanded `cie10Code` relation. Never drop an FK
 * the client just persisted.
 */
export function hydrateDiagnosisFromPatchEcho(
  echo: Pick<NestConsultation, "diagnosis" | "cie10CodeId" | "cie10Code">,
  sent: ConsultationDiagnosisState,
): ConsultationDiagnosisState {
  const cie10CodeId =
    echo.cie10CodeId !== undefined
      ? echo.cie10CodeId
      : echo.cie10Code?.id ?? sent.cie10CodeId;
  const cie10Code =
    echo.cie10Code ??
    (cie10CodeId &&
    sent.cie10CodeId === cie10CodeId &&
    sent.diagnosisCode
      ? {
          id: cie10CodeId,
          code: sent.diagnosisCode,
          descriptionEs: sent.diagnosisDescription,
        }
      : null);

  return hydrateDiagnosisFromConsultation({
    diagnosis: echo.diagnosis ?? sent.diagnosis,
    cie10CodeId,
    cie10Code,
  });
}

/** Draft item for free-text / pasted labels (no catalog id). */
export function diagnosisDraftItemFromText(text: string): {
  code: string;
  description: string;
} {
  const trimmed = text.trim();
  const parsed = parseDiagnosisLabel(trimmed);
  if (parsed) return parsed;
  return { code: "", description: trimmed };
}

export function diagnosisStateFromDraftItem(item: {
  code: string;
  description: string;
  cie10CodeId?: string;
}): ConsultationDiagnosisState {
  if (item.cie10CodeId) {
    return structuredDiagnosisFromPicker(item);
  }
  const code = item.code.trim();
  const description = item.description.trim();
  const text =
    code && description ? `${code} - ${description}` : description || code;
  return diagnosisStateFromText(text);
}

/**
 * Commit typed picker text only when it is a real draft, not a search fragment
 * over the already-committed label.
 */
export function shouldCommitDiagnosisPickerDraft(
  committedLabel: string,
  typed: string,
): boolean {
  const bound = committedLabel.trim();
  const next = typed.trim();
  if (next === bound) return false;
  if (!next) return true;
  if (!bound) return true;
  if (parseDiagnosisLabel(next)) return true;
  const boundLc = bound.toLowerCase();
  const nextLc = next.toLowerCase();
  if (boundLc.includes(nextLc) || nextLc.includes(boundLc)) return false;
  return true;
}

export function structuredDiagnosisFromPicker(item: {
  code: string;
  description: string;
  cie10CodeId?: string;
}): ConsultationDiagnosisState {
  const cie10CodeId = item.cie10CodeId ?? null;
  return {
    diagnosis: `${item.code} - ${item.description}`,
    cie10CodeId,
    diagnosisCode: item.code,
    diagnosisDescription: item.description,
    source: cie10CodeId ? "structured" : "parsed",
  };
}

export function diagnosisStateFromText(
  text: string,
  cie10CodeId?: string | null,
): ConsultationDiagnosisState {
  const trimmed = text.trim();
  if (!trimmed) {
    return emptyDiagnosisState();
  }
  if (cie10CodeId) {
    const parsed = parseDiagnosisLabel(trimmed);
    return {
      diagnosis: trimmed,
      cie10CodeId,
      diagnosisCode: parsed?.code ?? "",
      diagnosisDescription: parsed?.description ?? trimmed,
      source: "structured",
    };
  }
  return hydrateDiagnosisFromConsultation({
    diagnosis: trimmed,
    cie10CodeId: null,
    cie10Code: null,
  });
}

export function getDiagnosisBadgeVariant(
  source: DiagnosisSource,
): DiagnosisBadgeVariant | null {
  if (source === "empty") return null;
  if (source === "structured") return "structured";
  if (source === "parsed") return "parsed";
  return "free_text";
}

export function shouldShowUnlinkedWarning(
  source: DiagnosisSource,
  code: string,
): boolean {
  return source === "parsed" && code.trim().length > 0;
}

/** Único constructor de payload SOAP — confirm y autosave deben usar esta función. */
export function buildSoapPatch(input: {
  notes?: string;
  treatment?: string;
  diagnosis: ConsultationDiagnosisState;
}): UpdateConsultationDto {
  const body: UpdateConsultationDto = {};

  if (input.notes !== undefined) {
    body.notes = input.notes;
  }

  if (input.treatment !== undefined) {
    const treatment = input.treatment.trim();
    if (treatment) {
      body.treatmentPlan = treatment;
    }
  }

  const text = input.diagnosis.diagnosis.trim();
  if (text) {
    body.diagnosis = text;
  }

  body.cie10CodeId = input.diagnosis.cie10CodeId;

  return body;
}

/** Huella estable del PATCH SOAP para omitir escrituras idénticas consecutivas. */
export function soapPatchFingerprint(patch: UpdateConsultationDto): string {
  return JSON.stringify({
    notes: patch.notes ?? null,
    treatmentPlan: patch.treatmentPlan ?? null,
    diagnosis: patch.diagnosis ?? null,
    cie10CodeId: patch.cie10CodeId ?? null,
  });
}

import type { ClinicalVitalSigns } from "../clinical-vital-signs-context";
import type { PhysicalExam } from "../physical-exam-framework";

/** Clave de debounce del autosave — incluye FK para evitar carreras con el picker. */
export function buildSoapDraftKey(parts: {
  notes: string;
  treatment: string;
  diagnosis: ConsultationDiagnosisState;
  vitals?: ClinicalVitalSigns;
  physicalExam?: PhysicalExam;
  presentIllnessHistory?: string;
  antecedentsDraftKey?: string;
}): string {
  return JSON.stringify({
    notes: parts.notes,
    treatment: parts.treatment,
    diagnosis: parts.diagnosis.diagnosis,
    cie10CodeId: parts.diagnosis.cie10CodeId,
    vitals: parts.vitals ?? {},
    physicalExam: parts.physicalExam ?? {},
    presentIllnessHistory: parts.presentIllnessHistory ?? "",
    antecedentsDraftKey: parts.antecedentsDraftKey ?? "",
  });
}
