import { getMedicalCopilotClinicalQuestionGenerator } from "../../api";
import { mapClinicalQuestionGeneratorResultEnvelope } from "./clinical-question-generator-mapper";
import type { ClinicalQuestionGeneratorResultBuilderResult } from "./clinical-question-generator";

export async function getClinicalQuestionGenerator(sessionId: string): Promise<ClinicalQuestionGeneratorResultBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalQuestionGenerator(sessionId);
  return mapClinicalQuestionGeneratorResultEnvelope(envelope.data ?? envelope);
}

export type ClinicalQuestionGeneratorReadAdapter = { getClinicalQuestionGenerator: typeof getClinicalQuestionGenerator };
export const clinicalQuestionsReadAdapter: ClinicalQuestionGeneratorReadAdapter = { getClinicalQuestionGenerator };
