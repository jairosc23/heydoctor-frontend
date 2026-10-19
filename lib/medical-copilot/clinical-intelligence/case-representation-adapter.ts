/**
 * CI-8 — Read adapter for Clinical Case Representation (Facade only).
 */

import { getMedicalCopilotClinicalCaseRepresentation } from "../api";
import { mapCaseRepresentationEnvelope } from "./case-representation-mapper";
import type { ClinicalCaseRepresentationResult } from "./case-representation";

export async function getClinicalCaseRepresentation(
  sessionId: string,
): Promise<ClinicalCaseRepresentationResult | null> {
  const envelope =
    await getMedicalCopilotClinicalCaseRepresentation(sessionId);
  return mapCaseRepresentationEnvelope(envelope.data ?? envelope);
}

export type ClinicalCaseRepresentationReadAdapter = {
  getClinicalCaseRepresentation: typeof getClinicalCaseRepresentation;
};

export const clinicalCaseRepresentationReadAdapter: ClinicalCaseRepresentationReadAdapter =
  {
    getClinicalCaseRepresentation,
  };
