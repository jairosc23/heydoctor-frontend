import { getMedicalCopilotGovernedPopulationHealthPackage } from "@/lib/medical-copilot/api";
import { mapGovernedPopulationHealthPackageEnvelope } from "./governed-population-health-package-mapper";
import type { GovernedPopulationHealthPackageResult } from "./governed-population-health-package";
export type GovernedPopulationHealthPackageReadAdapter = { get: (sessionId: string) => Promise<GovernedPopulationHealthPackageResult | null> };
export async function getGovernedPopulationHealthPackage(sessionId: string): Promise<GovernedPopulationHealthPackageResult | null> { return mapGovernedPopulationHealthPackageEnvelope(await getMedicalCopilotGovernedPopulationHealthPackage(sessionId)); }
export const governedPopulationHealthPackageReadAdapter: GovernedPopulationHealthPackageReadAdapter = { get: getGovernedPopulationHealthPackage };
