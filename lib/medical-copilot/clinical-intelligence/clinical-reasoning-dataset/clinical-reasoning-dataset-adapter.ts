import { getMedicalCopilotClinicalReasoningDataset } from "../../api";
import { mapClinicalReasoningDatasetEnvelope } from "./clinical-reasoning-dataset-mapper";
import type { ClinicalReasoningDatasetBuilderResult } from "./clinical-reasoning-dataset";

export async function getClinicalReasoningDataset(sessionId: string): Promise<ClinicalReasoningDatasetBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReasoningDataset(sessionId);
  return mapClinicalReasoningDatasetEnvelope(envelope.data ?? envelope);
}

export type ClinicalReasoningDatasetReadAdapter = { getClinicalReasoningDataset: typeof getClinicalReasoningDataset };
export const clinicalReasoningDatasetReadAdapter: ClinicalReasoningDatasetReadAdapter = { getClinicalReasoningDataset };
