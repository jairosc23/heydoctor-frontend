import { heydoctorApi } from "@/lib/heydoctor-api";
import type { AssistConfirmedBody } from "./confirm-and-emit";
import type { ClinicalAssistPrefillDraft } from "./types";

export type ValidateEchoResponse = {
  ok: true;
  draft: ClinicalAssistPrefillDraft;
  checks: {
    sourceAssetType: string;
    evaluatedFalse: true;
    provenanceKind: string;
  };
};

export type AssistConfirmedResponse = {
  ok: true;
  persisted: boolean;
};

/** T5 — mandatory validate-echo (zero side-effects on server). */
export async function validateAssistIntakeEcho(
  draft: ClinicalAssistPrefillDraft,
): Promise<ValidateEchoResponse> {
  return heydoctorApi.post<ValidateEchoResponse>(
    "/clinical-assist/intake/validate",
    { draft },
  );
}

export async function fetchProtocolAssistPrefill(
  protocolId: string,
  versionId: string,
  options?: Record<string, unknown>,
): Promise<ClinicalAssistPrefillDraft> {
  return heydoctorApi.post<ClinicalAssistPrefillDraft>(
    `/clinical-protocols/${protocolId}/versions/${versionId}/assist-prefill`,
    options ?? {},
  );
}

/** M1 GET shorthand — current published version. */
export async function fetchCurrentProtocolAssistPrefill(
  protocolId: string,
): Promise<ClinicalAssistPrefillDraft> {
  return heydoctorApi.get<ClinicalAssistPrefillDraft>(
    `/clinical-protocols/${protocolId}/assist-prefill`,
  );
}

/** T7 — HTTP 200 + { ok, persisted } */
export async function postAssistConfirmed(
  protocolId: string,
  versionId: string,
  body: AssistConfirmedBody,
): Promise<AssistConfirmedResponse> {
  return heydoctorApi.post<AssistConfirmedResponse>(
    `/clinical-protocols/${protocolId}/versions/${versionId}/assist-confirmed`,
    body,
  );
}
