import { getMedicalCopilotGovernedDeterministicClinicalRulesPackage } from "../../api";
import { mapGovernedDeterministicClinicalRulesPackageEnvelope } from "./governed-deterministic-clinical-rules-package-mapper";
import type { GovernedDeterministicClinicalRulesPackageResult } from "./governed-deterministic-clinical-rules-package";
export async function getGovernedDeterministicClinicalRulesPackage(sessionId: string): Promise<GovernedDeterministicClinicalRulesPackageResult | null> {
  const envelope = await getMedicalCopilotGovernedDeterministicClinicalRulesPackage(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedDeterministicClinicalRulesPackageEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedDeterministicClinicalRulesPackageReadAdapter = { getGovernedDeterministicClinicalRulesPackage: typeof getGovernedDeterministicClinicalRulesPackage };
export const governedDeterministicClinicalRulesPackageReadAdapter: GovernedDeterministicClinicalRulesPackageReadAdapter = { getGovernedDeterministicClinicalRulesPackage };
