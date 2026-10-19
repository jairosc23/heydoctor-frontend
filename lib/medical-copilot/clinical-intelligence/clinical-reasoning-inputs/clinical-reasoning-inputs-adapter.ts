import { getMedicalCopilotClinicalReasoningInputs } from "../../api";
import { mapClinicalReasoningInputsEnvelope } from "./clinical-reasoning-inputs-mapper";
import type { ClinicalReasoningInputsBuilderResult } from "./clinical-reasoning-inputs";
export async function getClinicalReasoningInputs(sessionId: string): Promise<ClinicalReasoningInputsBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReasoningInputs(sessionId);
  return mapClinicalReasoningInputsEnvelope(envelope.data ?? envelope);
}
export type ClinicalReasoningInputsReadAdapter = { getClinicalReasoningInputs: typeof getClinicalReasoningInputs };
export const clinicalReasoningInputsReadAdapter: ClinicalReasoningInputsReadAdapter = { getClinicalReasoningInputs };
