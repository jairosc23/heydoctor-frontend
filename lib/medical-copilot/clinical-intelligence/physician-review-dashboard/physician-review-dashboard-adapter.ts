import { getMedicalCopilotPhysicianReviewDashboard } from "../../api";
import { mapPhysicianReviewDashboardEnvelope } from "./physician-review-dashboard-mapper";
import type { PhysicianReviewDashboardBuilderResult } from "./physician-review-dashboard";

export async function getPhysicianReviewDashboard(sessionId: string): Promise<PhysicianReviewDashboardBuilderResult | null> {
  const envelope = await getMedicalCopilotPhysicianReviewDashboard(sessionId);
  return mapPhysicianReviewDashboardEnvelope(envelope.data ?? envelope);
}

export type PhysicianReviewDashboardReadAdapter = { getPhysicianReviewDashboard: typeof getPhysicianReviewDashboard };
export const reviewDashboardReadAdapter: PhysicianReviewDashboardReadAdapter = { getPhysicianReviewDashboard };
