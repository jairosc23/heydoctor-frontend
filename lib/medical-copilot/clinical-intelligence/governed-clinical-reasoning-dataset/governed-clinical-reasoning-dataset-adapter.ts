import { getMedicalCopilotGovernedClinicalReasoningDataset } from "../../api";
import { mapGovernedClinicalReasoningDatasetEnvelope } from "./governed-clinical-reasoning-dataset-mapper";
import type { GovernedClinicalReasoningDatasetBuilderResult } from "./governed-clinical-reasoning-dataset";

export async function getGovernedClinicalReasoningDataset(sessionId: string): Promise<GovernedClinicalReasoningDatasetBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalReasoningDataset(sessionId);
  return mapGovernedClinicalReasoningDatasetEnvelope(envelope.data ?? envelope);
}

export type GovernedClinicalReasoningDatasetReadAdapter = { getGovernedClinicalReasoningDataset: typeof getGovernedClinicalReasoningDataset };
export const governedClinicalReasoningDatasetReadAdapter: GovernedClinicalReasoningDatasetReadAdapter = { getGovernedClinicalReasoningDataset };
