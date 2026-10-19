import { getMedicalCopilotGovernedDifferentialDiagnosisSuggestion } from "../../api";
import { mapGovernedDifferentialDiagnosisSuggestionEnvelope } from "./governed-differential-diagnosis-suggestion-mapper";
import type { GovernedDifferentialDiagnosisSuggestionResult } from "./governed-differential-diagnosis-suggestion";

export async function getGovernedDifferentialDiagnosisSuggestion(sessionId: string): Promise<GovernedDifferentialDiagnosisSuggestionResult | null> {
  const envelope = await getMedicalCopilotGovernedDifferentialDiagnosisSuggestion(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedDifferentialDiagnosisSuggestionEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedDifferentialDiagnosisSuggestionReadAdapter = { getGovernedDifferentialDiagnosisSuggestion: typeof getGovernedDifferentialDiagnosisSuggestion };
export const governedDifferentialDiagnosisSuggestionReadAdapter: GovernedDifferentialDiagnosisSuggestionReadAdapter = { getGovernedDifferentialDiagnosisSuggestion };
