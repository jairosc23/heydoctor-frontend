/**
 * EPIC-3 H1 — Review AI via existing AI Governance endpoints.
 * POST /ai/runs/:id/approve|reject (no EMR).
 */

import { heydoctorApi } from "../heydoctor-api";

const BASE = "/ai/runs";

export type AiRunProvenance = {
  aiRunId: string;
  promptVersion?: string | null;
  promptVersionId?: string;
  approvalState?: string;
  status?: string;
  correlationId?: string | null;
};

export async function approveAiRun(
  aiRunId: string,
  overrideReason?: string,
): Promise<AiRunProvenance> {
  return heydoctorApi.post<AiRunProvenance>(
    `${BASE}/${encodeURIComponent(aiRunId)}/approve`,
    overrideReason ? { overrideReason } : {},
  );
}

export async function rejectAiRun(
  aiRunId: string,
  rejectionReason: string,
): Promise<AiRunProvenance> {
  return heydoctorApi.post<AiRunProvenance>(
    `${BASE}/${encodeURIComponent(aiRunId)}/reject`,
    { rejectionReason },
  );
}
