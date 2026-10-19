/**
 * AI-13 — Read adapter for GovernedClinicalAIOutput (Facade only).
 */

import { getMedicalCopilotGovernedClinicalAIOutput } from "../../api";
import { mapGovernedClinicalAIOutputEnvelope } from "./governed-clinical-ai-output-mapper";
import type { GovernedClinicalAIOutputBuilderResult } from "./governed-clinical-ai-output";

export async function getGovernedClinicalAIOutput(
  sessionId: string,
): Promise<GovernedClinicalAIOutputBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalAIOutput(sessionId);
  return mapGovernedClinicalAIOutputEnvelope(envelope.data ?? envelope);
}

export type GovernedClinicalAIOutputReadAdapter = {
  getGovernedClinicalAIOutput: typeof getGovernedClinicalAIOutput;
};

export const outputReadAdapter: GovernedClinicalAIOutputReadAdapter = {
  getGovernedClinicalAIOutput,
};
