import {
  buildClinicalAiContextPrompt,
  type ClinicalAiContextInput,
} from "../ai-clinical-context";
import { humanizeAiClinicalError, isAiRateLimitError } from "../ai-clinical-errors";
import {
  recordAiResponseMetric,
} from "../ai-response-metrics";
import {
  enhanceConsultationSummary,
  isAiResponseEmpty,
  mapAssistToClinicalSummary,
} from "../clinical-summary-quality";
import { heydoctorApi, ApiError } from "../heydoctor-api";
import {
  buildUpdateConsultationBody,
  updateConsultation,
} from "./consultations";
import {
  requestConsultationAssist,
  type ConsultationAssistResponse,
} from "./consultation-assist";

export type ConsultationSummaryResponse = {
  summary: string;
  suggestedDiagnosis: string[];
  improvedNotes: string;
};

const SUMMARY_PATH = "/ai/consultation-summary";

export type ConsultationSummaryClientSnapshot = {
  clinicalContextPrompt?: string;
  chiefComplaint?: string;
  draftNotes?: string;
  treatment?: string;
  patientAge?: string;
  patientSex?: string;
};

export type ConsultationSummaryRequest = {
  consultationId: string;
  clientSnapshot?: ConsultationSummaryClientSnapshot;
};

/** Phase 4.5.3 — payload alineado con Clinical Summary v2 backend. */
export function buildConsultationSummaryRequest(
  input: EnrichedClinicalDocumentationInput,
): ConsultationSummaryRequest {
  const contextPrompt = buildClinicalAiContextPrompt({
    ...input,
    encounterNotes: input.encounterNotes ?? input.draftNotes,
    currentConsultationId:
      input.currentConsultationId ?? input.consultationId,
  });

  return {
    consultationId: input.consultationId,
    clientSnapshot: {
      clinicalContextPrompt: contextPrompt,
      chiefComplaint: input.chiefComplaint?.trim() || undefined,
      draftNotes: input.draftNotes?.trim() || undefined,
      treatment: input.treatment?.trim() || undefined,
      patientAge:
        input.patientAge != null ? String(input.patientAge) : undefined,
      patientSex: input.patientSex?.trim() || undefined,
    },
  };
}

export async function postConsultationSummary(
  input: ConsultationSummaryRequest | string,
  signal?: AbortSignal,
): Promise<ConsultationSummaryResponse> {
  const body =
    typeof input === "string" ? { consultationId: input } : input;
  return heydoctorApi.post<ConsultationSummaryResponse>(
    SUMMARY_PATH,
    body,
    signal,
  );
}

export type EnrichedClinicalDocumentationInput = ClinicalAiContextInput & {
  consultationId: string;
  cie10CodeId?: string | null;
  signal?: AbortSignal;
  patientAge?: string | number;
  patientSex?: string;
};

async function syncConsultationForAi(
  input: EnrichedClinicalDocumentationInput,
): Promise<void> {
  const diagnosis =
    input.diagnosisText?.trim() ||
    (input.activeDiagnosis
      ? `${input.activeDiagnosis.code} — ${input.activeDiagnosis.description}`
      : undefined);

  await updateConsultation(input.consultationId, {
    notes: input.draftNotes ?? undefined,
    diagnosis,
    cie10CodeId: input.cie10CodeId ?? undefined,
    treatment: input.treatment ?? undefined,
    chiefComplaint: input.chiefComplaint ?? undefined,
  });
}

function responseLength(res: ConsultationSummaryResponse): number {
  return (
    (res.summary?.length ?? 0) +
    (res.improvedNotes?.length ?? 0) +
    (res.suggestedDiagnosis ?? []).join("").length
  );
}

/**
 * Phase 4.5 — documentación clínica enriquecida sin cambios de backend:
 * 1) sincroniza SOAP en BD
 * 2) consultation-assist con contexto clínico completo
 * 3) fallback a consultation-summary si assist falla
 */
export async function requestEnrichedClinicalDocumentation(
  input: EnrichedClinicalDocumentationInput,
): Promise<ConsultationSummaryResponse> {
  const started = Date.now();
  const activeDiagnosis =
    input.activeDiagnosis != null
      ? `${input.activeDiagnosis.code} — ${input.activeDiagnosis.description}`
      : input.diagnosisText?.trim() || null;

  const contextPrompt = buildClinicalAiContextPrompt({
    ...input,
    encounterNotes: input.encounterNotes ?? input.draftNotes,
    currentConsultationId: input.currentConsultationId ?? input.consultationId,
  });

  try {
    await syncConsultationForAi(input);
  } catch (syncError) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[heydoctor][ai-doc] sync previo falló", syncError);
    }
  }

  let assist: ConsultationAssistResponse | null = null;
  try {
    assist = await requestConsultationAssist({
      chiefComplaint: input.chiefComplaint?.trim() || undefined,
      symptoms: contextPrompt,
      notes: input.draftNotes?.trim() || undefined,
    });
    const mapped = mapAssistToClinicalSummary(assist, {
      chiefComplaint: input.chiefComplaint,
      draftNotes: input.draftNotes,
      treatment: input.treatment,
      activeDiagnosis,
      encounterNotes: input.draftNotes,
    });
    recordAiResponseMetric({
      kind: "enriched_documentation",
      durationMs: Date.now() - started,
      status: isAiResponseEmpty(mapped) ? "empty" : "success",
      responseLength: responseLength(mapped),
    });
    return mapped;
  } catch (assistError) {
    if (isAiRateLimitError(assistError)) {
      recordAiResponseMetric({
        kind: "consultation_assist",
        durationMs: Date.now() - started,
        status: "rate_limited",
        responseLength: 0,
        errorCode: 429,
      });
      throw new ApiError(
        humanizeAiClinicalError(assistError) ?? "Rate limited",
        429,
      );
    }
    if (process.env.NODE_ENV === "development") {
      console.warn("[heydoctor][ai-doc] assist falló, fallback summary", assistError);
    }
  }

  try {
    const summary = await postConsultationSummary(
      buildConsultationSummaryRequest(input),
      input.signal,
    );
    const enhanced = enhanceConsultationSummary(summary, {
      chiefComplaint: input.chiefComplaint,
      draftNotes: input.draftNotes,
      treatment: input.treatment,
      activeDiagnosis,
      assist,
      encounterNotes: input.draftNotes,
    });
    recordAiResponseMetric({
      kind: "consultation_summary",
      durationMs: Date.now() - started,
      status: isAiResponseEmpty(enhanced) ? "empty" : "success",
      responseLength: responseLength(enhanced),
    });
    return enhanced;
  } catch (summaryError) {
    const rateLimited = isAiRateLimitError(summaryError);
    recordAiResponseMetric({
      kind: "consultation_summary",
      durationMs: Date.now() - started,
      status: rateLimited ? "rate_limited" : "error",
      responseLength: 0,
      errorCode:
        summaryError instanceof ApiError ? summaryError.status : undefined,
    });
    if (assist) {
      return mapAssistToClinicalSummary(assist, {
        chiefComplaint: input.chiefComplaint,
        draftNotes: input.draftNotes,
        treatment: input.treatment,
        activeDiagnosis,
        encounterNotes: input.draftNotes,
      });
    }
    throw summaryError;
  }
}

/** Exponer body de sync para tests. */
export function buildAiSyncPatch(input: EnrichedClinicalDocumentationInput) {
  const diagnosis =
    input.diagnosisText?.trim() ||
    (input.activeDiagnosis
      ? `${input.activeDiagnosis.code} — ${input.activeDiagnosis.description}`
      : undefined);
  return buildUpdateConsultationBody({
    notes: input.draftNotes ?? undefined,
    diagnosis,
    cie10CodeId: input.cie10CodeId ?? undefined,
    treatment: input.treatment ?? undefined,
    chiefComplaint: input.chiefComplaint ?? undefined,
  });
}
