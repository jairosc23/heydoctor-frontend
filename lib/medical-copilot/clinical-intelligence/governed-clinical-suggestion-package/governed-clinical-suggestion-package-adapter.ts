import { getMedicalCopilotGovernedClinicalSuggestionPackage } from "../../api";
import { mapGovernedClinicalSuggestionPackageEnvelope } from "./governed-clinical-suggestion-package-mapper";
import type { GovernedClinicalSuggestionPackageResult } from "./governed-clinical-suggestion-package";

export async function getGovernedClinicalSuggestionPackage(sessionId: string): Promise<GovernedClinicalSuggestionPackageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalSuggestionPackage(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalSuggestionPackageEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedClinicalSuggestionPackageReadAdapter = { getGovernedClinicalSuggestionPackage: typeof getGovernedClinicalSuggestionPackage };
export const governedClinicalSuggestionPackageReadAdapter: GovernedClinicalSuggestionPackageReadAdapter = { getGovernedClinicalSuggestionPackage };
