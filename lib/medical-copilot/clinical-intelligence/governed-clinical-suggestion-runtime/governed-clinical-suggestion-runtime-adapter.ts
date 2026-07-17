import { getMedicalCopilotGovernedClinicalSuggestionRuntime } from "../../api";
import { mapGovernedClinicalSuggestionRuntimeEnvelope } from "./governed-clinical-suggestion-runtime-mapper";
import type { GovernedClinicalSuggestionRuntimeResult } from "./governed-clinical-suggestion-runtime";

export async function getGovernedClinicalSuggestionRuntime(sessionId: string): Promise<GovernedClinicalSuggestionRuntimeResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalSuggestionRuntime(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalSuggestionRuntimeEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedClinicalSuggestionRuntimeReadAdapter = { getGovernedClinicalSuggestionRuntime: typeof getGovernedClinicalSuggestionRuntime };
export const governedClinicalSuggestionRuntimeReadAdapter: GovernedClinicalSuggestionRuntimeReadAdapter = { getGovernedClinicalSuggestionRuntime };
