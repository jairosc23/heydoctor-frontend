import { getMedicalCopilotGovernedGuidelineConflictResolutionEngine } from "@/lib/medical-copilot/api";
import { mapGovernedGuidelineConflictResolutionEngineEnvelope } from "./governed-guideline-conflict-resolution-engine-mapper";
import type { GovernedGuidelineConflictResolutionEngineResult } from "./governed-guideline-conflict-resolution-engine";

export type GovernedGuidelineConflictResolutionEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedGuidelineConflictResolutionEngineResult | null>;
};

export async function getGovernedGuidelineConflictResolutionEngine(sessionId: string): Promise<GovernedGuidelineConflictResolutionEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedGuidelineConflictResolutionEngine(sessionId);
  return mapGovernedGuidelineConflictResolutionEngineEnvelope(envelope);
}

export const governedGuidelineConflictResolutionEngineReadAdapter: GovernedGuidelineConflictResolutionEngineReadAdapter = { get: getGovernedGuidelineConflictResolutionEngine };
