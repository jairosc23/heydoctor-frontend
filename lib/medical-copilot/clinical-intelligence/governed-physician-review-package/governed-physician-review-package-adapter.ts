import { getMedicalCopilotGovernedPhysicianReviewPackage } from "../../api";
import { mapGovernedPhysicianReviewPackageEnvelope } from "./governed-physician-review-package-mapper";
import type { GovernedPhysicianReviewPackageBuilderResult } from "./governed-physician-review-package";

export async function getGovernedPhysicianReviewPackage(sessionId: string): Promise<GovernedPhysicianReviewPackageBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedPhysicianReviewPackage(sessionId);
  return mapGovernedPhysicianReviewPackageEnvelope(envelope.data ?? envelope);
}

export type GovernedPhysicianReviewPackageReadAdapter = { getGovernedPhysicianReviewPackage: typeof getGovernedPhysicianReviewPackage };
export const physicianReviewPackageReadAdapter: GovernedPhysicianReviewPackageReadAdapter = { getGovernedPhysicianReviewPackage };
