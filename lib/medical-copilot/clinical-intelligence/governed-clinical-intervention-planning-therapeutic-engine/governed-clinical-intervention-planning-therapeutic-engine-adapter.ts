import { getMedicalCopilotGovernedClinicalInterventionPlanningTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalInterventionPlanningTherapeuticEngineEnvelope } from "./governed-clinical-intervention-planning-therapeutic-engine-mapper";
import type { GovernedClinicalInterventionPlanningTherapeuticEngineResult } from "./governed-clinical-intervention-planning-therapeutic-engine";
export type GovernedClinicalInterventionPlanningTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalInterventionPlanningTherapeuticEngineResult | null> };
export async function getGovernedClinicalInterventionPlanningTherapeuticEngine(sessionId: string): Promise<GovernedClinicalInterventionPlanningTherapeuticEngineResult | null> { return mapGovernedClinicalInterventionPlanningTherapeuticEngineEnvelope(await getMedicalCopilotGovernedClinicalInterventionPlanningTherapeuticEngine(sessionId)); }
export const governedClinicalInterventionPlanningTherapeuticEngineReadAdapter: GovernedClinicalInterventionPlanningTherapeuticEngineReadAdapter = { get: getGovernedClinicalInterventionPlanningTherapeuticEngine };
