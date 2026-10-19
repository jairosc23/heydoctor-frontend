import { getMedicalCopilotGovernedClinicalKnowledgePackage } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalKnowledgePackageEnvelope } from "./governed-clinical-knowledge-package-mapper";
import type { GovernedClinicalKnowledgePackageResult } from "./governed-clinical-knowledge-package";

export type GovernedClinicalKnowledgePackageReadAdapter = {
  get: (sessionId: string) => Promise<GovernedClinicalKnowledgePackageResult | null>;
};

export async function getGovernedClinicalKnowledgePackage(sessionId: string): Promise<GovernedClinicalKnowledgePackageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalKnowledgePackage(sessionId);
  return mapGovernedClinicalKnowledgePackageEnvelope(envelope);
}

export const governedClinicalKnowledgePackageReadAdapter: GovernedClinicalKnowledgePackageReadAdapter = {
  get: getGovernedClinicalKnowledgePackage,
};
