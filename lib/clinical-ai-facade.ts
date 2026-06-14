/**
 * Phase 4.8.3A — ClinicalAiFacade™
 * Puerta de entrada única frontend hacia capacidades IA generativas.
 * Sin cambios de UX, backend ni payloads.
 */

import {
  buildClinicalAiContextPrompt,
  type ClinicalAiContextInput,
} from "./ai-clinical-context";
import { humanizeAiClinicalError, isAiRateLimitError } from "./ai-clinical-errors";
import { ApiError, heydoctorApi } from "./heydoctor-api";
import {
  recordAiResponseMetric,
  type AiMetricKind,
} from "./ai-response-metrics";
import {
  enhanceConsultationSummary,
  isAiResponseEmpty,
  mapAssistToClinicalSummary,
} from "./clinical-summary-quality";
import {
  autofillClinicalRecord,
  type AutofillContext,
  type AutofillResult,
} from "./services/clinical-record";
import {
  requestConsultationAssist,
  type ConsultationAssistRequest,
  type ConsultationAssistResponse,
} from "./services/consultation-assist";
import {
  buildUpdateConsultationBody,
  fetchConsultationAi,
  updateConsultation,
  type ConsultationAiPayload,
} from "./services/consultations";

export type ClinicalAiOperation =
  | "inline_note_suggestions"
  | "consultation_assist"
  | "consultation_insights"
  | "autofill_record"
  | "consultation_summary";

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

export type EnrichedClinicalDocumentationInput = ClinicalAiContextInput & {
  consultationId: string;
  cie10CodeId?: string | null;
  signal?: AbortSignal;
  patientAge?: string | number;
  patientSex?: string;
};

export type ClinicalAiFacadeResult<T> = {
  requestId: string;
  data: T;
};

export type ClinicalAiBeforeRequestHook = (
  operation: ClinicalAiOperation,
  requestId: string,
) => void | Promise<void>;

const beforeRequestHooks: ClinicalAiBeforeRequestHook[] = [];

export function registerClinicalAiBeforeRequestHook(
  hook: ClinicalAiBeforeRequestHook,
): () => void {
  beforeRequestHooks.push(hook);
  return () => {
    const idx = beforeRequestHooks.indexOf(hook);
    if (idx >= 0) beforeRequestHooks.splice(idx, 1);
  };
}

export function createClinicalAiRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function runBeforeRequestHooks(
  operation: ClinicalAiOperation,
  requestId: string,
): Promise<void> {
  for (const hook of beforeRequestHooks) {
    await hook(operation, requestId);
  }
}

function recordMetric(
  requestId: string,
  kind: AiMetricKind,
  started: number,
  status: "success" | "error" | "empty" | "rate_limited",
  responseLength: number,
  errorCode?: number,
): void {
  recordAiResponseMetric({
    requestId,
    kind,
    durationMs: Date.now() - started,
    status,
    responseLength,
    errorCode,
  });
}

function responseLength(res: ConsultationSummaryResponse): number {
  return (
    (res.summary?.length ?? 0) +
    (res.improvedNotes?.length ?? 0) +
    (res.suggestedDiagnosis ?? []).join("").length
  );
}

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

async function postConsultationSummary(
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

/**
 * LiveAiNoteSuggestions™ — documentación enriquecida inline (assist → summary fallback).
 */
export async function getInlineNoteSuggestions(
  input: EnrichedClinicalDocumentationInput,
): Promise<ClinicalAiFacadeResult<ConsultationSummaryResponse>> {
  const requestId = createClinicalAiRequestId();
  const started = Date.now();
  await runBeforeRequestHooks("inline_note_suggestions", requestId);

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
      console.warn("[heydoctor][ai-facade] sync previo falló", syncError);
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
    recordMetric(
      requestId,
      "enriched_documentation",
      started,
      isAiResponseEmpty(mapped) ? "empty" : "success",
      responseLength(mapped),
    );
    return { requestId, data: mapped };
  } catch (assistError) {
    if (isAiRateLimitError(assistError)) {
      recordMetric(requestId, "consultation_assist", started, "rate_limited", 0, 429);
      throw new ApiError(
        humanizeAiClinicalError(assistError) ?? "Rate limited",
        429,
      );
    }
    if (process.env.NODE_ENV === "development") {
      console.warn("[heydoctor][ai-facade] assist falló, fallback summary", assistError);
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
    recordMetric(
      requestId,
      "consultation_summary",
      started,
      isAiResponseEmpty(enhanced) ? "empty" : "success",
      responseLength(enhanced),
    );
    return { requestId, data: enhanced };
  } catch (summaryError) {
    const rateLimited = isAiRateLimitError(summaryError);
    recordMetric(
      requestId,
      "consultation_summary",
      started,
      rateLimited ? "rate_limited" : "error",
      0,
      summaryError instanceof ApiError ? summaryError.status : undefined,
    );
    if (assist) {
      const mapped = mapAssistToClinicalSummary(assist, {
        chiefComplaint: input.chiefComplaint,
        draftNotes: input.draftNotes,
        treatment: input.treatment,
        activeDiagnosis,
        encounterNotes: input.draftNotes,
      });
      return { requestId, data: mapped };
    }
    throw summaryError;
  }
}

/** Consultation Assist Panel™ — asistencia generativa bajo demanda. */
export async function getConsultationAssist(
  body: ConsultationAssistRequest,
): Promise<ClinicalAiFacadeResult<ConsultationAssistResponse>> {
  const requestId = createClinicalAiRequestId();
  const started = Date.now();
  await runBeforeRequestHooks("consultation_assist", requestId);

  try {
    const data = await requestConsultationAssist(body);
    const responseLengthEstimate =
      (data.possibleDiagnoses?.join("").length ?? 0) +
      (data.recommendations?.join("").length ?? 0) +
      (data.generalEducation?.join("").length ?? 0);
    recordMetric(
      requestId,
      "consultation_assist",
      started,
      responseLengthEstimate > 0 ? "success" : "empty",
      responseLengthEstimate,
    );
    return { requestId, data };
  } catch (error) {
    recordMetric(
      requestId,
      "consultation_assist",
      started,
      isAiRateLimitError(error) ? "rate_limited" : "error",
      0,
      error instanceof ApiError ? error.status : undefined,
    );
    throw error;
  }
}

/** AI Insights Panel™ — payload IA cacheado por consulta. */
export async function getConsultationInsights(
  consultationId: string,
): Promise<ClinicalAiFacadeResult<ConsultationAiPayload>> {
  const requestId = createClinicalAiRequestId();
  const started = Date.now();
  await runBeforeRequestHooks("consultation_insights", requestId);

  try {
    const data = await fetchConsultationAi(consultationId);
    const len =
      (data.summary?.length ?? 0) +
      (data.improvedNotes?.length ?? 0) +
      (data.suggestedDiagnosis?.join("").length ?? 0);
    recordMetric(
      requestId,
      "consultation_insights",
      started,
      len > 0 ? "success" : "empty",
      len,
    );
    return { requestId, data };
  } catch (error) {
    recordMetric(
      requestId,
      "consultation_insights",
      started,
      isAiRateLimitError(error) ? "rate_limited" : "error",
      0,
      error instanceof ApiError ? error.status : undefined,
    );
    throw error;
  }
}

/** Clinical Record Panel™ / menú Análisis IA — autofill ficha estructurada. */
export async function autofillStructuredRecord(
  consultationId: string,
  ctx: AutofillContext,
): Promise<ClinicalAiFacadeResult<AutofillResult>> {
  const requestId = createClinicalAiRequestId();
  const started = Date.now();
  await runBeforeRequestHooks("autofill_record", requestId);

  try {
    const data = await autofillClinicalRecord(consultationId, ctx);
    const len = JSON.stringify(data.record).length;
    recordMetric(
      requestId,
      "autofill_record",
      started,
      data.source === "ai" ? "success" : "empty",
      len,
    );
    return { requestId, data };
  } catch (error) {
    recordMetric(
      requestId,
      "autofill_record",
      started,
      "error",
      0,
      error instanceof ApiError ? error.status : undefined,
    );
    throw error;
  }
}

/** Alias de compatibilidad Phase 4.5 — mismo comportamiento que getInlineNoteSuggestions. */
export async function requestEnrichedClinicalDocumentation(
  input: EnrichedClinicalDocumentationInput,
): Promise<ConsultationSummaryResponse> {
  const { data } = await getInlineNoteSuggestions(input);
  return data;
}

/** Exponer body de sync para tests Phase 4.5.1. */
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

export type { ConsultationAssistRequest, ConsultationAssistResponse };
export type { ConsultationAiPayload };
export type { AutofillContext, AutofillResult };
