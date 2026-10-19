/**
 * CI-9 — Read adapter for Clinical Context (Facade only).
 */

import { getMedicalCopilotClinicalContext } from "../api";
import { mapClinicalContextEnvelope } from "./clinical-context-mapper";
import type { ClinicalContextResult } from "./clinical-context";

export async function getClinicalContext(
  sessionId: string,
): Promise<ClinicalContextResult | null> {
  const envelope = await getMedicalCopilotClinicalContext(sessionId);
  return mapClinicalContextEnvelope(envelope.data ?? envelope);
}

export type ClinicalContextReadAdapter = {
  getClinicalContext: typeof getClinicalContext;
};

export const clinicalContextReadAdapter: ClinicalContextReadAdapter = {
  getClinicalContext,
};
