import { getMedicalCopilotGovernedClinicalDecisionPackage } from "../../api";
import { mapGovernedClinicalDecisionPackageEnvelope } from "./governed-clinical-decision-package-mapper";
import type { GovernedClinicalDecisionPackageResult } from "./governed-clinical-decision-package";

export async function getGovernedClinicalDecisionPackage(sessionId: string): Promise<GovernedClinicalDecisionPackageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalDecisionPackage(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalDecisionPackageEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedClinicalDecisionPackageReadAdapter = { getGovernedClinicalDecisionPackage: typeof getGovernedClinicalDecisionPackage };
export const governedClinicalDecisionPackageReadAdapter: GovernedClinicalDecisionPackageReadAdapter = { getGovernedClinicalDecisionPackage };
