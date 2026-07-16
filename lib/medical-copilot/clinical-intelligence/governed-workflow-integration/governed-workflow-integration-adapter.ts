/**
 * AI-15 — Read adapter for GovernedWorkflowIntegration (Facade only).
 */

import { getMedicalCopilotGovernedWorkflowIntegration } from "../../api";
import { mapGovernedWorkflowIntegrationEnvelope } from "./governed-workflow-integration-mapper";
import type { GovernedWorkflowIntegrationBuilderResult } from "./governed-workflow-integration";

export async function getGovernedWorkflowIntegration(
  sessionId: string,
): Promise<GovernedWorkflowIntegrationBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedWorkflowIntegration(sessionId);
  return mapGovernedWorkflowIntegrationEnvelope(envelope.data ?? envelope);
}

export type GovernedWorkflowIntegrationReadAdapter = {
  getGovernedWorkflowIntegration: typeof getGovernedWorkflowIntegration;
};

export const integrationReadAdapter: GovernedWorkflowIntegrationReadAdapter = {
  getGovernedWorkflowIntegration,
};
