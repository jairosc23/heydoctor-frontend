import { getMedicalCopilotClinicalCompletenessAnalyzer } from "../../api";
import { mapClinicalCompletenessAnalyzerResultEnvelope } from "./clinical-completeness-analyzer-mapper";
import type { ClinicalCompletenessAnalyzerResultBuilderResult } from "./clinical-completeness-analyzer";

export async function getClinicalCompletenessAnalyzer(sessionId: string): Promise<ClinicalCompletenessAnalyzerResultBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalCompletenessAnalyzer(sessionId);
  return mapClinicalCompletenessAnalyzerResultEnvelope(envelope.data ?? envelope);
}

export type ClinicalCompletenessAnalyzerReadAdapter = { getClinicalCompletenessAnalyzer: typeof getClinicalCompletenessAnalyzer };
export const completenessReadAdapter: ClinicalCompletenessAnalyzerReadAdapter = { getClinicalCompletenessAnalyzer };
